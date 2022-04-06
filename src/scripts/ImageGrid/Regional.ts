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
    ProjectionLike,
    get as getCachedProjection,
} from "ol/proj";
import ImageTile from "ol/ImageTile";
import Tile from "ol/Tile";
import { AttributionLike } from "ol/source/Source";
import TileGrid from "ol/tilegrid/TileGrid";
import TileImage from "ol/source/TileImage";

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

export type RegionalProps = {
    url: string;
    imageExtent: number[];
    projection: ProjectionLike;
    rotate?: number;
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
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

export class Regional extends TileImage {
    private imageExtent_: number[];
    private context_: CanvasRenderingContext2D | null;

    constructor(userOptions: RegionalProps) {
        const options = userOptions || {};
        const tileSize = options.tileSize ? options.tileSize : DEFAULT_TILE_SIZE;

        const projection = getCachedProjection(options.projection);
        if (!projection) throw new Error("projection is necessary.");

        let imageExtent = [Infinity, Infinity, -Infinity, -Infinity];
        if (Array.isArray(options.imageExtent) && options.imageExtent.length > 3) {
            imageExtent = options.imageExtent;
        }
        if (
            imageExtent[2] <= imageExtent[0] || imageExtent[3] <= imageExtent[1]
        ) throw new Error("invalid extent.");
        let rad = 0;
        if (options.rotate) {
            rad = options.rotate;
            imageExtent = rotateExtent(imageExtent, rad)
        }

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

                const window = getWindow(imageExtent, z, x, y);
                const tileLeft = window[0];
                const tileRight = window[2];
                const tileTop = window[1];
                const tileBottom = window[3];
                const [
                    imageExtentLeft, imageExtentBottom, imageExtentRight, imageExtentTop
                ] = this.imageExtent_;


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

        const interpolate =
            options.interpolate !== undefined ? options.interpolate : true;

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

        this.imageExtent_ = imageExtent;

        const extentWidth = imageExtent[2] - imageExtent[0];
        const extentHeight = imageExtent[3] - imageExtent[1];
        const originExtentAspectRatio = extentWidth / extentHeight;


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

        image.addEventListener("load", () => {
            let imageWidth = image.width;
            let imageHeight = image.height;

            if (imageWidth < imageHeight) {
                imageHeight = imageWidth / originExtentAspectRatio;
            } else {
                imageWidth = imageHeight * originExtentAspectRatio;
            }

            const rotatedCoordinates = rotateExtent([0, 0, imageWidth, imageHeight], rad);
            const rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
            const rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];

            const sourceResolution = Math.max(
                (this.imageExtent_[2] - this.imageExtent_[0]) / rotatedWidth,
                (this.imageExtent_[3] - this.imageExtent_[1]) / rotatedHeight
            );
            const maxResolution = Math.max(extentWidth, extentHeight) / tileSize;
            const tileGrid = new TileGrid({
                extent: this.imageExtent_,
                tileSize: tileSize,
                minZoom: options.minZoom,
                resolutions: resolutionsFromExtent(this.imageExtent_, {
                    maxZoom: options.maxZoom,
                    tileSize: tileSize,
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
                context.drawImage(image, 0, 0, image.width, image.height, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
                context.restore();

                this.setState(SourceState.READY);
            } else {
                this.setState(SourceState.ERROR);
            }
        });
        image.addEventListener("error", () => {
            this.setState(SourceState.ERROR);
        });

        image.src = options.url;
    }
}