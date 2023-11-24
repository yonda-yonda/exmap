import { getHeight, getWidth } from "ol/extent";
import ImageTile from "ol/ImageTile";
import { ProjectionLike, get as getCachedProjection } from "ol/proj";
import { PROJECTIONS as EPSG3857_PROJECTIONS } from "ol/proj/epsg3857";
import { PROJECTIONS as EPSG4326_PROJECTIONS } from "ol/proj/epsg4326";
import { AttributionLike } from "ol/source/Source";
import TileImage from "ol/source/TileImage";
import Tile from "ol/Tile";
import { DEFAULT_MAX_ZOOM, DEFAULT_TILE_SIZE } from "ol/tilegrid/common";
import TileGrid from "ol/tilegrid/TileGrid";
import TileState from "ol/TileState";

const HALF_WORLD_3857 = Math.PI * 6378137;
const EXTENT = {
    3857: [-HALF_WORLD_3857, -HALF_WORLD_3857, HALF_WORLD_3857, HALF_WORLD_3857],
    4326: [-180, -90, 180, 90],
};

function is4326(code?: string) {
    return !!EPSG4326_PROJECTIONS.find((projection) => {
        return projection.getCode() === code;
    });
}
function is3857(code?: string) {
    return !!EPSG3857_PROJECTIONS.find((projection) => {
        return projection.getCode() === code;
    });
}

function rotateExtent(extent: number[], rad: number): number[] {
    const center = [
        (extent[2] - extent[0]) / 2 + extent[0],
        (extent[3] - extent[1]) / 2 + extent[1],
    ];
    const leftTop = [
        (extent[0] - center[0]) * Math.cos(rad) -
        (extent[3] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) +
        (extent[3] - center[1]) * Math.cos(rad),
    ];
    const leftBottom = [
        (extent[0] - center[0]) * Math.cos(rad) -
        (extent[1] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) +
        (extent[1] - center[1]) * Math.cos(rad),
    ];
    const rightBottom = [
        (extent[2] - center[0]) * Math.cos(rad) -
        (extent[1] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) +
        (extent[1] - center[1]) * Math.cos(rad),
    ];
    const rightTop = [
        (extent[2] - center[0]) * Math.cos(rad) -
        (extent[3] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) +
        (extent[3] - center[1]) * Math.cos(rad),
    ];

    return [
        Math.min(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) +
        center[0],
        Math.min(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) +
        center[1],
        Math.max(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) +
        center[0],
        Math.max(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) +
        center[1],
    ];
}

interface ResolutionsFromExtentOptions {
    maxZoom?: number;
    tileSize?: number;
    maxResolution?: number;
    sourceResolution?: number;
}
function resolutionsFromExtent(
    extent: number[],
    options?: ResolutionsFromExtentOptions
): number[] {
    const maxZoom =
        options?.maxZoom !== undefined ? options.maxZoom : DEFAULT_MAX_ZOOM;

    const height = getHeight(extent);
    const width = getWidth(extent);

    const tileSize =
        options?.tileSize !== undefined ? options.tileSize : DEFAULT_TILE_SIZE;
    const maxResolution =
        options?.maxResolution && options.maxResolution > 0
            ? options.maxResolution
            : Math.max(width / tileSize, height / tileSize);

    const sourceResolution =
        options?.sourceResolution && options.sourceResolution > 0
            ? options.sourceResolution
            : 0;

    const length = maxZoom + 1;
    const resolutions: number[] = [];
    for (let z = 0; z < length; ++z) {
        const resolution = maxResolution / Math.pow(2, z);
        if (resolution < sourceResolution) break;
        resolutions.push(resolution);
    }
    return resolutions;
}

function getWindow(
    gridExtent: number[],
    z: number,
    x: number,
    y: number
): number[] {
    const size =
        Math.max(gridExtent[2] - gridExtent[0], gridExtent[3] - gridExtent[1]) /
        2 ** z;
    const left = gridExtent[0] + x * size;
    const top = gridExtent[3] - y * size;
    const right = left + size;
    const bottom = top - size;

    return [left, top, right, bottom];
}

function crossing(extentLeft: number[], extentRight: number[]): boolean {
    return (
        Math.max(extentLeft[0], extentRight[0]) <=
        Math.min(extentLeft[2], extentRight[2]) &&
        Math.max(extentLeft[1], extentRight[1]) <=
        Math.min(extentLeft[3], extentRight[3])
    );
}

export type ImageGridProps = {
    url?: string;
    file?: File;
    imageExtent: number[];
    projection: ProjectionLike;
    rotate?: number;
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
    maxPixel?: number;
    maxWidth?: number;
    maxHeight?: number;
    attributions?: AttributionLike;
    attributionsCollapsible?: boolean;
    cacheSize?: number;
    crossOrigin?: string | null;
    interpolate?: boolean;
    opaque?: boolean;
    reprojectionErrorThreshold?: number;
    tilePixelRatio?: number;
    wrapX?: boolean;
    transition?: number;
};

export class ImageGrid extends TileImage {
    private isGlobalGrid_: boolean;
    private context_: CanvasRenderingContext2D | null;

    constructor(userOptions: ImageGridProps) {
        const options = userOptions || {};
        if (!options.url && !options.file)
            throw new Error("source url or file is necessary.");

        const tileSize =
            typeof options.tileSize !== "undefined"
                ? options.tileSize
                : DEFAULT_TILE_SIZE;
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
        const maxPixel =
            typeof options.maxPixel !== "undefined" ? options.maxPixel : 268435456;
        const maxHeight =
            typeof options.maxHeight !== "undefined" ? options.maxHeight : 32767;
        const maxWidth =
            typeof options.maxWidth !== "undefined" ? options.maxWidth : 32767;

        const projection = getCachedProjection(options.projection);
        if (!projection) throw new Error("Unsupported projection");

        let imageExtent = [Infinity, Infinity, -Infinity, -Infinity];
        if (Array.isArray(options.imageExtent) && options.imageExtent.length > 3) {
            imageExtent = options.imageExtent;
        }
        const originExtentAspectRatio =
            (imageExtent[2] - imageExtent[0]) / (imageExtent[3] - imageExtent[1]);
        let gridExtent = imageExtent;
        let gridExtentWidth = gridExtent[2] - gridExtent[0];
        let gridExtentHeight = gridExtent[3] - gridExtent[1];
        let rad = 0;
        if (options.rotate) {
            rad = options.rotate;
            imageExtent = rotateExtent(imageExtent, rad);
        }

        const tileLoadFunction = (imageTile: Tile, coordString: string) => {
            const [z, x, y] = coordString.split(",").map(Number);
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const tempCanvas = document.createElement("canvas");
            const tempContext = tempCanvas.getContext("2d");
            if (!this.context_ || !context || !tempContext) {
                imageTile.setState(TileState.ERROR);
                return;
            }
            canvas.width = tileSize;
            canvas.height = tileSize;

            const window = getWindow(
                this.isGlobalGrid_ ? gridExtent : imageExtent,
                z,
                x,
                y
            );
            let tileLeft = window[0];
            let tileRight = window[2];
            const tileTop = window[1];
            const tileBottom = window[3];
            const [
                imageExtentLeft,
                imageExtentBottom,
                imageExtentRight,
                imageExtentTop,
            ] = imageExtent;

            if (this.isGlobalGrid_) {
                const extentWidth = gridExtent[2] - gridExtent[0];
                if (imageExtentLeft < gridExtent[0] && tileRight > 0) {
                    tileLeft -= extentWidth;
                    tileRight -= extentWidth;
                } else if (gridExtent[2] < imageExtentRight && tileLeft < 0) {
                    tileLeft += extentWidth;
                    tileRight += extentWidth;
                }

                if (
                    !crossing(
                        [
                            imageExtentLeft,
                            imageExtentBottom,
                            imageExtentRight,
                            imageExtentTop,
                        ],
                        [tileLeft, tileBottom, tileRight, tileTop]
                    )
                ) {
                    imageTile.setState(TileState.EMPTY);
                }
            }

            const sourcePerPixel = [
                (imageExtentRight - imageExtentLeft) / this.context_.canvas.width,
                (imageExtentTop - imageExtentBottom) / this.context_.canvas.height,
            ];
            const tilePerPixel = [
                (tileRight - tileLeft) / tileSize,
                (tileTop - tileBottom) / tileSize,
            ];
            const leftBottom = [
                Math.max(tileLeft, imageExtentLeft),
                Math.max(imageExtentBottom, tileBottom),
            ];
            const rightTop = [
                Math.min(tileRight, imageExtentRight),
                Math.min(imageExtentTop, tileTop),
            ];
            const tileRect = [
                Math.round((leftBottom[0] - tileLeft) / tilePerPixel[0]),
                Math.round((tileTop - rightTop[1]) / tilePerPixel[1]),
                Math.round((rightTop[0] - tileLeft) / tilePerPixel[0]),
                Math.round((tileTop - leftBottom[1]) / tilePerPixel[1]),
            ];
            const sourceRect = [
                Math.round((leftBottom[0] - imageExtentLeft) / sourcePerPixel[0]),
                Math.round((imageExtentTop - rightTop[1]) / sourcePerPixel[1]),
                Math.round((rightTop[0] - imageExtentLeft) / sourcePerPixel[0]),
                Math.round((imageExtentTop - leftBottom[1]) / sourcePerPixel[1]),
            ];
            const sourceRectSize = [
                sourceRect[2] - sourceRect[0],
                sourceRect[3] - sourceRect[1],
            ];
            const tileRectSize = [
                tileRect[2] - tileRect[0],
                tileRect[3] - tileRect[1],
            ];

            if (Math.min(...sourceRectSize, ...tileRectSize) <= 0) {
                imageTile.setState(TileState.EMPTY);
                return;
            }
            tempCanvas.width = sourceRectSize[0];
            tempCanvas.height = sourceRectSize[1];
            tempContext.clearRect(0, 0, sourceRectSize[0], sourceRectSize[1]);
            tempContext.putImageData(
                this.context_.getImageData(
                    sourceRect[0],
                    sourceRect[1],
                    sourceRectSize[0],
                    sourceRectSize[1]
                ),
                0,
                0
            );
            context.drawImage(
                tempCanvas,
                0,
                0,
                sourceRectSize[0],
                sourceRectSize[1],
                tileRect[0],
                tileRect[1],
                tileRectSize[0],
                tileRectSize[1]
            );

            const src = canvas.toDataURL();
            ((imageTile as ImageTile).getImage() as HTMLImageElement).src = src;
        };

        const interpolate =
            options.interpolate !== undefined ? options.interpolate : true;

        super({
            state: "loading",
            attributions: options.attributions,
            cacheSize: options.cacheSize,
            crossOrigin: options.crossOrigin,
            interpolate,
            opaque: options.opaque,
            projection,
            reprojectionErrorThreshold: options.reprojectionErrorThreshold,
            tileLoadFunction,
            tilePixelRatio: options.tilePixelRatio,
            url: "{z},{x},{y}",
            wrapX: options.wrapX !== undefined ? options.wrapX : true,
            transition: options.transition,
            attributionsCollapsible: options.attributionsCollapsible,
        });
        this.isGlobalGrid_ = false;
        const code = projection.getCode();
        if (options.wrapX) {
            const globalGridExtent = is4326(code)
                ? EXTENT[4326]
                : is3857(code)
                    ? EXTENT[3857]
                    : null;
            if (globalGridExtent) {
                gridExtent = globalGridExtent;
                if (
                    imageExtent[0] < gridExtent[0] - gridExtentWidth / 2 ||
                    gridExtent[2] + gridExtentWidth / 2 < imageExtent[0] ||
                    imageExtent[1] < gridExtent[1] ||
                    gridExtent[3] < imageExtent[1] ||
                    imageExtent[2] < gridExtent[0] - gridExtentWidth / 2 ||
                    gridExtent[2] + gridExtentWidth / 2 < imageExtent[2] ||
                    imageExtent[3] < gridExtent[1] ||
                    gridExtent[3] < imageExtent[3] ||
                    imageExtent[2] <= imageExtent[0] ||
                    imageExtent[0] - imageExtent[2] > gridExtentWidth
                )
                    throw new Error("invalid extent.");

                gridExtentWidth = gridExtent[2] - gridExtent[0];
                gridExtentHeight = gridExtent[3] - gridExtent[1];
                this.isGlobalGrid_ = true;
            }
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
            this.context_ = null;
            return;
        }
        context.imageSmoothingEnabled = interpolate;
        this.context_ = context;

        const image = new Image();
        image.crossOrigin = options.crossOrigin || "";

        let url = "";
        if (options.file) url = URL.createObjectURL(options.file);
        else if (options.url) url = options.url;
        image.addEventListener("load", () => {
            if (options.file) URL.revokeObjectURL(url);

            let imageWidth = image.width;
            let imageHeight = image.height;

            if (imageWidth < imageHeight) {
                imageHeight = imageWidth / originExtentAspectRatio;
            } else {
                imageWidth = imageHeight * originExtentAspectRatio;
            }

            const rotatedCoordinates = rotateExtent(
                [0, 0, imageWidth, imageHeight],
                rad
            );
            let rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
            let rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];
            if (rotatedWidth < rotatedHeight) {
                if (rotatedWidth < tileSize) {
                    const r = tileSize / rotatedWidth;
                    rotatedWidth = tileSize;
                    rotatedHeight *= r;
                    imageWidth *= r;
                    imageHeight *= r;
                }
            } else {
                if (imageHeight < tileSize) {
                    const r = tileSize / rotatedHeight;
                    rotatedHeight = tileSize;
                    rotatedWidth *= r;
                    imageWidth *= r;
                    imageHeight *= r;
                }
            }

            if (maxWidth > 0 && maxWidth < rotatedWidth) {
                const scale = maxWidth / rotatedWidth;
                rotatedWidth *= scale;
                rotatedHeight *= scale;
                imageWidth *= scale;
                imageHeight *= scale;
            }

            if (maxHeight > 0 && maxHeight < rotatedHeight) {
                const scale = maxHeight / rotatedHeight;
                rotatedWidth *= scale;
                rotatedHeight *= scale;
                imageWidth *= scale;
                imageHeight *= scale;
            }

            if (maxPixel > 0 && maxPixel < rotatedWidth * rotatedHeight) {
                const scale = Math.sqrt(maxPixel / (rotatedWidth * rotatedHeight));
                rotatedWidth *= scale;
                rotatedHeight *= scale;
                imageWidth *= scale;
                imageHeight *= scale;
            }

            const sourceResolution = Math.max(
                (imageExtent[2] - imageExtent[0]) / rotatedWidth,
                (imageExtent[3] - imageExtent[1]) / rotatedHeight
            );
            const maxResolution =
                Math.max(gridExtentWidth, gridExtentHeight) / tileSize;
            const tileGrid = new TileGrid({
                extent: gridExtent,
                tileSize,
                minZoom: options.minZoom,
                resolutions: resolutionsFromExtent(gridExtent, {
                    maxZoom: options.maxZoom,
                    tileSize,
                    maxResolution,
                    sourceResolution,
                }),
            });
            if (tileGrid) {
                this.tileGrid = tileGrid;
                canvas.width = rotatedWidth;
                canvas.height = rotatedHeight;

                context.save();
                context.translate(rotatedWidth / 2, rotatedHeight / 2);
                context.rotate(-rad);
                context.drawImage(
                    image,
                    0,
                    0,
                    image.width,
                    image.height,
                    -imageWidth / 2,
                    -imageHeight / 2,
                    imageWidth,
                    imageHeight
                );
                context.restore();

                this.setState("ready");
            } else {
                this.setState("error");
            }
        });
        image.addEventListener("error", () => {
            if (options.file) URL.revokeObjectURL(url);
            this.setState("error");
        });

        image.src = url;
    }
}
