import SourceState from "ol/source/State";
import TileState from "ol/TileState";
import {
    DEFAULT_MAX_ZOOM,
    DEFAULT_TILE_SIZE
} from "ol/tilegrid/common";
import {
    getHeight,
    getWidth,
} from "ol/extent";
import {
    get as getCachedProjection,
} from "ol/proj";
import ImageTile from "ol/ImageTile";
import Tile from "ol/Tile";
import TileGrid from "ol/tilegrid/TileGrid";
import TileImage, { Options as TileImageOptions } from "ol/source/TileImage";
import { PROJECTIONS as EPSG4326_PROJECTIONS } from "ol/proj/epsg4326";
import { PROJECTIONS as EPSG3857_PROJECTIONS } from "ol/proj/epsg3857";

const HALF_WORLD_3857 = Math.PI * 6378137;
const EXTENT = {
    3857: [-HALF_WORLD_3857, -HALF_WORLD_3857, HALF_WORLD_3857, HALF_WORLD_3857],
    4326: [-180, -90, 180, 90],
};

function is4326(code?: string) {
    return !!(EPSG4326_PROJECTIONS.find((projection) => {
        return projection.getCode() === code
    }))
}
function is3857(code?: string) {
    return !!(EPSG3857_PROJECTIONS.find((projection) => {
        return projection.getCode() === code
    }))
}


function rotateExtent(extent: number[], rad: number): number[] {
    const center = [(extent[2] - extent[0]) / 2 + extent[0], (extent[3] - extent[1]) / 2 + extent[1]];
    const leftTop = [
        (extent[0] - center[0]) * Math.cos(rad) - (extent[3] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) + (extent[3] - center[1]) * Math.cos(rad),
    ];
    const leftBottom = [
        (extent[0] - center[0]) * Math.cos(rad) - (extent[1] - center[1]) * Math.sin(rad),
        (extent[0] - center[0]) * Math.sin(rad) + (extent[1] - center[1]) * Math.cos(rad),
    ];
    const rightBottom = [
        (extent[2] - center[0]) * Math.cos(rad) - (extent[1] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) + (extent[1] - center[1]) * Math.cos(rad),
    ];
    const rightTop = [
        (extent[2] - center[0]) * Math.cos(rad) - (extent[3] - center[1]) * Math.sin(rad),
        (extent[2] - center[0]) * Math.sin(rad) + (extent[3] - center[1]) * Math.cos(rad),
    ];

    return [
        Math.min(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) + center[0],
        Math.min(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) + center[1],
        Math.max(leftTop[0], leftBottom[0], rightBottom[0], rightTop[0]) + center[0],
        Math.max(leftTop[1], leftBottom[1], rightBottom[1], rightTop[1]) + center[1],
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
    const maxZoom = options?.maxZoom !== undefined ? options.maxZoom : DEFAULT_MAX_ZOOM;

    const height = getHeight(extent);
    const width = getWidth(extent);

    const tileSize = options?.tileSize !== undefined ? options.tileSize : DEFAULT_TILE_SIZE;
    const maxResolution =
        options?.maxResolution && options.maxResolution > 0 ?
            options.maxResolution :
            Math.max(width / tileSize, height / tileSize);

    const sourceResolution =
        options?.sourceResolution && options.sourceResolution > 0 ? options.sourceResolution : 0;


    const length = maxZoom + 1;
    const resolutions: number[] = [];
    for (let z = 0; z < length; ++z) {
        const resolution = maxResolution / Math.pow(2, z);
        if (resolution < sourceResolution) break;
        resolutions.push(resolution);
    }
    return resolutions;
}

function getWindow(gridExtent: number[], z: number, x: number, y: number,): number[] {
    const size = Math.max(gridExtent[2] - gridExtent[0], gridExtent[3] - gridExtent[1]) / (2 ** z);
    const left = gridExtent[0] + x * size;
    const top = gridExtent[3] - y * size;
    const right = left + size;
    const bottom = top - size;

    return [left, top, right, bottom]
}

function crossing(extentLeft: number[], extentRight: number[]): boolean {
    return Math.max(extentLeft[0], extentRight[0]) <= Math.min(extentLeft[2], extentRight[2]) &&
        Math.max(extentLeft[1], extentRight[1]) <= Math.min(extentLeft[3], extentRight[3])
}

export type ImageGridProps = {
    url: string;
    imageExtent: number[];
    rotate?: number;
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
} & TileImageOptions;

export class ImageGrid extends TileImage {
    private imageExtent_: number[];
    private context_: CanvasRenderingContext2D | null;

    constructor(userOptions: ImageGridProps) {
        const options = userOptions || {};
        const tileSize = options.tileSize ? options.tileSize : DEFAULT_TILE_SIZE;

        const projection = getCachedProjection(options.projection);
        const code = projection?.getCode();
        const gridExtent = is4326(code) ? EXTENT[4326] : is3857(code) ? EXTENT[3857] : null;
        if (!projection || !gridExtent) throw new Error("Unsupported projection");

        const tileLoadFunction =
            (imageTile: Tile, coordString: string) => {
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

                const window = getWindow(gridExtent, z, x, y);
                let tileLeft = window[0];
                let tileRight = window[2];
                const tileTop = window[1];
                const tileBottom = window[3];
                const [
                    imageExtentLeft, imageExtentBottom, imageExtentRight, imageExtentTop
                ] = this.imageExtent_;

                const extentWidth = gridExtent[2] - gridExtent[0];
                if (imageExtentLeft < gridExtent[0] && 0 < tileRight) {
                    tileLeft -= extentWidth;
                    tileRight -= extentWidth;
                } else if (gridExtent[2] < imageExtentRight && tileLeft < 0) {
                    tileLeft += extentWidth;
                    tileRight += extentWidth;
                }

                if (!crossing([
                    imageExtentLeft, imageExtentBottom, imageExtentRight, imageExtentTop
                ], [
                    tileLeft, tileBottom, tileRight, tileTop
                ])) {
                    imageTile.setState(TileState.EMPTY);
                }

                const sourcePerPixel = [(imageExtentRight - imageExtentLeft) / this.context_.canvas.width, (imageExtentTop - imageExtentBottom) / this.context_.canvas.height];
                const tilePerPixel = [(tileRight - tileLeft) / tileSize, (tileTop - tileBottom) / tileSize];
                const leftBottom = [Math.max(tileLeft, imageExtentLeft), Math.max(imageExtentBottom, tileBottom)];
                const rightTop = [Math.min(tileRight, imageExtentRight), Math.min(imageExtentTop, tileTop)];
                const tileRect = [
                    Math.round((leftBottom[0] - tileLeft) / tilePerPixel[0]), Math.round((tileTop - rightTop[1]) / tilePerPixel[1]),
                    Math.round((rightTop[0] - tileLeft) / tilePerPixel[0]), Math.round((tileTop - leftBottom[1]) / tilePerPixel[1])
                ];
                const sourceRect = [
                    Math.round((leftBottom[0] - imageExtentLeft) / sourcePerPixel[0]), Math.round((imageExtentTop - rightTop[1]) / sourcePerPixel[1]),
                    Math.round((rightTop[0] - imageExtentLeft) / sourcePerPixel[0]), Math.round((imageExtentTop - leftBottom[1]) / sourcePerPixel[1])
                ];
                const sourceRectSize = [sourceRect[2] - sourceRect[0], sourceRect[3] - sourceRect[1]];
                const tileRectSize = [tileRect[2] - tileRect[0], tileRect[3] - tileRect[1]];

                if (Math.min(...sourceRectSize, ...tileRectSize) <= 0) {
                    imageTile.setState(TileState.EMPTY);
                    return
                }
                tempCanvas.width = sourceRectSize[0];
                tempCanvas.height = sourceRectSize[1];
                tempContext.clearRect(0, 0, sourceRectSize[0], sourceRectSize[1]);
                tempContext.putImageData(this.context_.getImageData(sourceRect[0], sourceRect[1], sourceRectSize[0], sourceRectSize[1]), 0, 0);
                context.drawImage(tempCanvas, 0, 0, sourceRectSize[0], sourceRectSize[1], tileRect[0], tileRect[1], tileRectSize[0], tileRectSize[1]);

                const src = canvas.toDataURL();
                ((imageTile as ImageTile).getImage() as HTMLImageElement).src = src;
            };

        let interpolate =
            options.imageSmoothing !== undefined ? options.imageSmoothing : true;
        if (options.interpolate !== undefined) {
            interpolate = options.interpolate;
        }
        super({
            state: SourceState.LOADING,
            attributions: options.attributions,
            cacheSize: options.cacheSize,
            crossOrigin: options.crossOrigin,
            interpolate: interpolate,
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


        this.imageExtent_ = [Infinity, Infinity, -Infinity, -Infinity];
        if (Array.isArray(options.imageExtent) && options.imageExtent.length > 3) {
            this.imageExtent_ = options.imageExtent;
        }

        const extentWidth = gridExtent[2] - gridExtent[0];
        const extentHeight = gridExtent[3] - gridExtent[1];
        if (
            this.imageExtent_[0] < -gridExtent[0] - extentWidth / 2 || gridExtent[2] + extentWidth / 2 < this.imageExtent_[0] ||
            this.imageExtent_[1] < gridExtent[1] || gridExtent[3] < this.imageExtent_[1] ||
            this.imageExtent_[2] < -gridExtent[0] - extentWidth / 2 || gridExtent[2] + extentWidth / 2 < this.imageExtent_[2] ||
            this.imageExtent_[3] < gridExtent[1] || gridExtent[3] < this.imageExtent_[3] ||
            this.imageExtent_[2] <= this.imageExtent_[0] ||
            this.imageExtent_[0] - this.imageExtent_[2] > extentWidth
        ) throw new Error("invalid extent.");

        let rad = 0;
        if (options.rotate) {
            rad = options.rotate;
            this.imageExtent_ = rotateExtent(this.imageExtent_, rad)
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
            this.context_ = null;
            return;
        }
        context.imageSmoothingEnabled = interpolate !== undefined ? interpolate : true;
        this.context_ = context;

        const image = new Image();
        image.crossOrigin = options.crossOrigin || "";

        image.addEventListener("load", () => {
            const sourceResolution = Math.max(
                (this.imageExtent_[2] - this.imageExtent_[0]) / image.width,
                (this.imageExtent_[3] - this.imageExtent_[1]) / image.height
            );
            const maxResolution = Math.max(extentWidth, extentHeight) / tileSize;
            const tileGrid = new TileGrid({
                extent: gridExtent,
                tileSize: tileSize,
                minZoom: options.minZoom,
                resolutions: resolutionsFromExtent(gridExtent, {
                    maxZoom: options.maxZoom,
                    tileSize: tileSize,
                    maxResolution,
                    sourceResolution,
                }),
            });
            if (tileGrid)
                this.tileGrid = tileGrid;
            const rotatedCoordinates = rotateExtent([0, 0, image.width, image.height], rad);
            const rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
            const rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];
            canvas.width = rotatedWidth;
            canvas.height = rotatedHeight;

            context.save();
            context.translate(rotatedWidth / 2, rotatedHeight / 2);
            context.rotate(-rad);
            context.drawImage(image, -(image.width / 2), -(image.height / 2));
            context.restore();
            this.setState(SourceState.READY);
        });
        image.addEventListener("error", () => {
            this.setState(SourceState.ERROR);
        });

        image.src = options.url;
    }
}