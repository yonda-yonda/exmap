import SourceState from "ol/source/State";
import TileState from "ol/TileState";
import {
    DEFAULT_MAX_ZOOM,
    DEFAULT_TILE_SIZE
} from "ol/tilegrid/common";
import {
    getHeight,
    getWidth,
}
    from "ol/extent";
import {
    toSize
} from "ol/size.js";
import ImageTile from "ol/ImageTile";
import Tile from "ol/Tile";
import TileGrid from "ol/tilegrid/TileGrid";
import TileImage, { Options as TileImageOptions } from "ol/source/TileImage";

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

function resolutionsFromExtent(
    extent: number[],
    opt_maxZoom?: number,
    opt_tileSize?: number,
    opt_maxResolution?: number
): number[] {
    const maxZoom = opt_maxZoom !== undefined ? opt_maxZoom : DEFAULT_MAX_ZOOM;

    const height = getHeight(extent);
    const width = getWidth(extent);

    const tileSize = toSize(
        opt_tileSize !== undefined ? opt_tileSize : DEFAULT_TILE_SIZE
    );
    const maxResolution =
        opt_maxResolution && opt_maxResolution > 0 ?
            opt_maxResolution :
            Math.max(width / tileSize[0], height / tileSize[1]);

    const length = maxZoom + 1;
    const resolutions: number[] = new Array(length);
    for (let z = 0; z < length; ++z) {
        resolutions[z] = maxResolution / Math.pow(2, z + 1);
    }
    return resolutions;
}

function toLonLat(z: number, x: number, y: number): number[] {
    const size = 180 / (2 ** z);
    const lon = -180 + x * size;
    const lat = 90 - y * size;
    return [lon, lat, size]
}

function crossing(extentLeft: number[], extentRight: number[]): boolean {
    return Math.max(extentLeft[0], extentRight[0]) <= Math.min(extentLeft[2], extentRight[2]) && Math.max(extentLeft[1], extentRight[1]) <= Math.min(extentLeft[3], extentRight[3])
}


export type ImageWGS84Props = {
    url: string;
    imageExtent: number[];
    rotate?: number;
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
} & TileImageOptions;

export class ImageWGS84 extends TileImage {
    private imageExtent_: number[];
    private context_: CanvasRenderingContext2D | null;

    constructor(opt_options: ImageWGS84Props) {
        const options = opt_options || {};
        const tileSize = options.tileSize ? options.tileSize : DEFAULT_TILE_SIZE;
        const gridExtent = [-180, -90, 180, 90];
        const tileGrid = new TileGrid({
            extent: gridExtent,
            tileSize: tileSize,
            minZoom: opt_options.minZoom,
            resolutions: resolutionsFromExtent(gridExtent, opt_options.maxZoom, tileSize, 360 / tileSize),
        });

        const tileLoadFunction =
            (imageTile: Tile, coordString: string) => {
                const [z, x, y] = coordString.split(",").map(Number);

                const canvas = document.createElement("canvas");
                canvas.width = tileSize;
                canvas.height = tileSize;
                const context = canvas.getContext("2d");
                if (!context || !this.context_) {
                    imageTile.setState(TileState.ERROR);
                    return;
                }

                const [leftTopLon, leftTopLat, size] = toLonLat(z, x, y);
                const [
                    imageExtentLeft, imageExtentBottom, imageExtentRight, imageExtentTop
                ] = this.imageExtent_;

                let tileLeft = leftTopLon;
                let tileRight = leftTopLon + size;
                const tileBottom = leftTopLat - size;
                const tileTop = leftTopLat;

                if (imageExtentLeft < -180 && 0 < tileRight) {
                    tileLeft -= 360;
                    tileRight -= 360;
                } else if (180 < imageExtentRight && tileLeft < 0) {
                    tileLeft += 360;
                    tileRight += 360;
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

                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = sourceRectSize[0];
                tempCanvas.height = sourceRectSize[1];
                const tempContext = tempCanvas.getContext("2d");
                if (tempContext) {
                    tempContext.clearRect(0, 0, sourceRectSize[0], sourceRectSize[1]);
                    tempContext.putImageData(this.context_.getImageData(sourceRect[0], sourceRect[1], sourceRectSize[0], sourceRectSize[1]), 0, 0);
                    context.drawImage(tempCanvas, 0, 0, sourceRectSize[0], sourceRectSize[1], tileRect[0], tileRect[1], tileRectSize[0], tileRectSize[1]);
                }

                ((imageTile as ImageTile).getImage() as HTMLImageElement).src =
                    canvas.toDataURL();

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
            projection: "EPSG:4326",
            reprojectionErrorThreshold: options.reprojectionErrorThreshold,
            tileGrid: tileGrid,
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
        if (
            this.imageExtent_[0] < -360 || 360 < this.imageExtent_[0] ||
            this.imageExtent_[1] < -90 || 90 < this.imageExtent_[1] ||
            this.imageExtent_[2] < -360 || 360 < this.imageExtent_[2] ||
            this.imageExtent_[3] < -90 || 90 < this.imageExtent_[3] ||
            this.imageExtent_[2] <= this.imageExtent_[0] ||
            this.imageExtent_[0] - this.imageExtent_[2] > 360
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
        try {
            image.src = options.url;
        } catch {
            console.log(1111111);
        }
    }
}