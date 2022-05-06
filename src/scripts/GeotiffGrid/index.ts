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
import { transform, Projection, get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import ImageTile from "ol/ImageTile";
import Tile from "ol/Tile";
import { AttributionLike } from "ol/source/Source";
import TileGrid from "ol/tilegrid/TileGrid";
import TileImage from "ol/source/TileImage";
import { PROJECTIONS as EPSG4326_PROJECTIONS } from "ol/proj/epsg4326";
import { PROJECTIONS as EPSG3857_PROJECTIONS } from "ol/proj/epsg3857";
import { utils } from "geo4326";
import { Reader, Layer, RendererMode } from "./Reader";
export { colormaps, type RendererMode } from "./Reader";

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

function roundScale(v: number, scale: number) {
    return Math.round(v * scale);
}

function rotatePixelExtent(extent: number[], rad: number): number[] {
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

function rotate(size: number[], affin: number[]): [number[], number] {
    const [width, height] = size;
    const leftTop = [0, 0];
    const leftBottom = [0, height];
    const rightBottom = [width, height];
    const rightTop = [width, 0];
    const transformed = [leftTop, leftBottom, rightBottom, rightTop].map((v) => {
        if (affin.length === 16)
            return [
                affin[0] * v[0] + affin[1] * v[1] + affin[3],
                affin[4] * v[0] + affin[5] * v[1] + affin[7],
            ]

        return [
            affin[0] * v[0] + affin[1] * v[1] + affin[2],
            affin[3] * v[0] + affin[4] * v[1] + affin[5],
        ]
    });
    const xs = transformed.map((v) => { return v[0] });
    const ys = transformed.map((v) => { return v[1] });
    const beforeOrienting = [
        leftTop[0] - leftBottom[0], leftTop[1] - leftBottom[1]
    ]; // lefthand to righthand 
    const afterOrienting = [
        transformed[1][0] - transformed[0][0], transformed[1][1] - transformed[0][1]
    ];
    const inner = beforeOrienting[0] * afterOrienting[0] + beforeOrienting[1] * afterOrienting[1];
    const outer = beforeOrienting[0] * afterOrienting[1] - beforeOrienting[1] * afterOrienting[0];
    const angle = -1 * Math.atan2(outer, inner); // righthand to lefthand

    return [
        [
            Math.min(...xs),
            Math.min(...ys),
            Math.max(...xs),
            Math.max(...ys),
        ], angle
    ];
}

interface SampleConfig {
    index: number;
    bands: number[]; // 1-based
    nodata?: number;
}

export interface SourceConfig {
    index: number;
    band: number; // 1-based
    nodata?: number;
    min?: number;
    max?: number;
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

export type GeoTIFFGridProps = {
    urls?: string[];
    files?: File[];
    sources: SourceConfig[];
    minZoom?: number;
    maxZoom?: number;
    tileSize?: number;
    maxPixel?: number;
    maxWidth?: number;
    maxHeight?: number;
    mode?: RendererMode;
    cmap?: string;
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

export class GeoTIFFGrid extends TileImage {
    private isGlobalGrid_: boolean;
    private context_: CanvasRenderingContext2D | null;
    private width_: number;
    private height_: number;
    private reader_: Reader;
    private samples_: SampleConfig[];
    private layers_: Layer[];
    private imageExtent_: number[] | null;
    private gridExtent_: number[] | null;
    private mode_: RendererMode;
    private cmap_: string | null;

    constructor(userOptions: GeoTIFFGridProps) {
        const options = userOptions || {};
        const tileSize = typeof options.tileSize !== "undefined" ? options.tileSize : DEFAULT_TILE_SIZE;
        const interpolate =
            options.interpolate !== undefined ? options.interpolate : true;

        const tileLoadFunction =
            (imageTile: Tile, coordString: string) => {
                const [z, x, y] = coordString.split(",").map(Number);
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                const tempCanvas = document.createElement("canvas");
                const tempContext = tempCanvas.getContext("2d");
                if (!this.imageExtent_ || !this.gridExtent_ || !this.context_ || !context || !tempContext) {
                    imageTile.setState(TileState.ERROR);
                    return;
                }
                canvas.width = tileSize;
                canvas.height = tileSize;
                context.imageSmoothingEnabled = interpolate;

                const window = getWindow(this.isGlobalGrid_ ? this.gridExtent_ : this.imageExtent_, z, x, y);
                let tileLeft = window[0];
                let tileRight = window[2];
                const tileTop = window[1];
                const tileBottom = window[3];
                const [
                    imageExtentLeft, imageExtentBottom, imageExtentRight, imageExtentTop
                ] = this.imageExtent_;

                if (this.isGlobalGrid_) {
                    const extentWidth = this.gridExtent_[2] - this.gridExtent_[0];
                    if (imageExtentLeft < this.gridExtent_[0] && 0 < tileRight) {
                        tileLeft -= extentWidth;
                        tileRight -= extentWidth;
                    } else if (this.gridExtent_[2] < imageExtentRight && tileLeft < 0) {
                        tileLeft += extentWidth;
                        tileRight += extentWidth;
                    }

                    if (!crossing([
                        imageExtentLeft, imageExtentBottom, imageExtentRight, imageExtentTop
                    ], [
                        tileLeft, tileBottom, tileRight, tileTop
                    ])) {
                        imageTile.setState(TileState.EMPTY);
                        return;
                    }
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
                tempContext.putImageData(this.context_.getImageData(sourceRect[0], sourceRect[1], sourceRectSize[0], sourceRectSize[1]), 0, 0);
                context.drawImage(tempCanvas, 0, 0, sourceRectSize[0], sourceRectSize[1], tileRect[0], tileRect[1], tileRectSize[0], tileRectSize[1]);

                const src = canvas.toDataURL();
                ((imageTile as ImageTile).getImage() as HTMLImageElement).src = src;
            };

        super({
            state: SourceState.LOADING,
            attributions: options.attributions,
            cacheSize: options.cacheSize,
            crossOrigin: options.crossOrigin,
            interpolate: interpolate,
            opaque: options.opaque,
            reprojectionErrorThreshold: options.reprojectionErrorThreshold,
            tileLoadFunction,
            tilePixelRatio: options.tilePixelRatio,
            url: "{z},{x},{y}",
            wrapX: options.wrapX !== undefined ? options.wrapX : true,
            transition: options.transition,
            attributionsCollapsible: options.attributionsCollapsible,
        });

        this.width_ = 0;
        this.height_ = 0;
        this.isGlobalGrid_ = false;
        this.imageExtent_ = null;
        this.gridExtent_ = null;
        this.context_ = null;
        this.mode_ = options.mode && ["rgb", "single", "ndi"].includes(options.mode) ? options.mode : "rgb";
        this.cmap_ = options.cmap || null;

        const sources = options.sources || [];

        const samples: SampleConfig[] = [];
        const layers: Layer[] = [];
        const mapping: [number, number, (number | undefined), (number | undefined)][] = [];
        sources.forEach(({
            index, band, nodata, min, max
        }) => {
            const existed = samples.findIndex((sample) => {
                return sample.index === index
            });
            if (existed >= 0 && samples[existed].nodata === nodata) {
                mapping.push([existed, samples[existed].bands.length, min, max]);
                samples[existed].bands.push(band);
            } else {
                mapping.push([samples.length, 0, min, max]);
                samples.push({
                    index,
                    bands: [band],
                    nodata,
                });
            }
        });
        mapping.forEach(([sampleIndex, bandIndex, min, max]) => {
            let index = 0;
            for (let i = 0; i < sampleIndex; i++) {
                index += samples[i].bands.length;
            }
            index += bandIndex;

            layers.push({
                index, min, max
            });
        });

        this.samples_ = samples;
        this.layers_ = layers;
        this.reader_ = new Reader({ files: options.files, urls: options.urls });

        this.setup({
            tileSize,
            maxPixel: options.maxPixel,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            interpolate: options.interpolate
        })
    }

    getBoundingBox(dstCode?: string): number[] | null {
        const originExtent = this.imageExtent_;
        const srcCode = this.projection.getCode();
        if (!originExtent || !srcCode) return null;
        if (!dstCode) return originExtent;

        let dstProjection = getProjection(dstCode);
        if (!dstProjection) {
            try {
                const crs = utils.getCrs(dstCode);
                proj4.defs(dstCode, crs);
                register(proj4);
                dstProjection = getProjection(dstCode);
            } catch {
                throw new Error("Unsupported projection.");
            }
        }
        const checkedDstCode = dstProjection?.getCode();
        if (!checkedDstCode) return null;
        if (!dstCode || srcCode === checkedDstCode) return originExtent;

        const transformed = [
            ...transform([originExtent[0], originExtent[1]], srcCode, checkedDstCode),
            ...transform([originExtent[2], originExtent[3]], srcCode, checkedDstCode)
        ]
        const worldExtent = is4326(checkedDstCode) ? EXTENT[4326] : is3857(checkedDstCode) ? EXTENT[3857] : null;
        if (transformed[0] > transformed[2] && worldExtent) {
            transformed[2] += (worldExtent[2] - worldExtent[0]);
        }
        return transformed;
    }

    getSize(): number[] | null {
        if (!this.width_ && !this.height_)
            return [this.width_, this.height_];
        return null;
    }

    private async setup(options: {
        tileSize: number;
        maxPixel?: number;
        maxWidth?: number;
        maxHeight?: number;
        minZoom?: number;
        maxZoom?: number;
        wrapX?: boolean;
        interpolate?: boolean;
    }) {
        if (!this.reader_) return;
        const reader = this.reader_;
        const tileSize = options.tileSize;

        //https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
        const maxPixel = typeof options.maxPixel !== "undefined" ? options.maxPixel : 268435456;
        const maxHeight = typeof options.maxHeight !== "undefined" ? options.maxHeight : 32767;
        const maxWidth = typeof options.maxWidth !== "undefined" ? options.maxWidth : 32767;

        let code: string | null = null;
        let unit: string | null = null;
        let imageWidth = 0;
        let imageHeight = 0;
        let imageExtent: number[] = [];
        let affin: number[] | null = null;
        let angle = 0;
        for (let i = 0; i < this.samples_.length; i++) {
            if (i === 0) {
                code = await reader.getCode(this.samples_[0].index);
                unit = await reader.getUnit(this.samples_[0].index);
                const image = await reader.getImage(this.samples_[0].index);
                imageWidth = image?.getWidth() || 1;
                imageHeight = image?.getHeight() || 1;
                imageExtent = image?.getBoundingBox() || [0, 0, imageWidth, imageHeight];
                if (image?.getFileDirectory()?.ModelTransformation) {
                    const transformation = image.getFileDirectory().ModelTransformation;
                    affin = Array.from({ length: 6 }).fill(0) as number[];
                    affin[0] = transformation[0];
                    affin[1] = transformation[1];
                    affin[2] = transformation[3];
                    affin[3] = transformation[4];
                    affin[4] = transformation[5];
                    affin[5] = transformation[7];
                }
            }
            else {
                const image = await reader.getImage(this.samples_[i].index);
                if (imageWidth !== image?.getWidth()) {
                    this.setState(SourceState.ERROR);
                    throw new Error("Unmatched width.");
                }
                if (imageHeight !== image?.getHeight()) {
                    this.setState(SourceState.ERROR);
                    throw new Error("Unmatched height.");
                }
            }
        }

        let projection = code ? getProjection(code) : null;
        if (!projection) {
            if (code) {
                try {
                    const crs = utils.getCrs(code);
                    proj4.defs(code, crs);
                    register(proj4);
                    projection = getProjection(code);
                } catch {
                    if (unit) {
                        projection = new Projection({
                            code: code,
                            units: unit,
                        });
                    }
                }
            }
        }
        if (!code || !projection) {
            this.setState(SourceState.ERROR);
            throw new Error("Unsupported projection.");
        }
        this.projection = projection;
        const originExtentSize = [imageExtent[2] - imageExtent[0], imageExtent[3] - imageExtent[1]];
        const originExtentAspectRatio = originExtentSize[0] / originExtentSize[1];
        if (affin)
            [imageExtent, angle] = rotate([imageWidth, imageHeight], affin);
        let gridExtent = imageExtent;
        let gridExtentWidth = gridExtent[2] - gridExtent[0];
        let gridExtentHeight = gridExtent[3] - gridExtent[1];

        if (options.wrapX) {
            const globalGridExtent = is4326(code) ? EXTENT[4326] : is3857(code) ? EXTENT[3857] : null;
            if (globalGridExtent) {
                gridExtent = globalGridExtent;
                if (
                    imageExtent[0] < gridExtent[0] - gridExtentWidth / 2 || gridExtent[2] + gridExtentWidth / 2 < imageExtent[0] ||
                    imageExtent[1] < gridExtent[1] || gridExtent[3] < imageExtent[1] ||
                    imageExtent[2] < gridExtent[0] - gridExtentWidth / 2 || gridExtent[2] + gridExtentWidth / 2 < imageExtent[2] ||
                    imageExtent[3] < gridExtent[1] || gridExtent[3] < imageExtent[3] ||
                    imageExtent[2] <= imageExtent[0] ||
                    imageExtent[0] - imageExtent[2] > gridExtentWidth
                ) {
                    this.setState(SourceState.ERROR);
                    throw new Error("invalid extent.");
                }
                gridExtentWidth = gridExtent[2] - gridExtent[0];
                gridExtentHeight = gridExtent[3] - gridExtent[1];
                this.isGlobalGrid_ = true;
            }
        }

        this.imageExtent_ = imageExtent;
        this.gridExtent_ = gridExtent;

        if (imageWidth < imageHeight) {
            imageHeight = imageWidth / originExtentAspectRatio;
        } else {
            imageWidth = imageHeight * originExtentAspectRatio;
        }

        const rotatedCoordinates = rotatePixelExtent([0, 0, imageWidth, imageHeight], angle);
        let rotatedWidth = rotatedCoordinates[2] - rotatedCoordinates[0];
        let rotatedHeight = rotatedCoordinates[3] - rotatedCoordinates[1];

        if (maxWidth > 0 && maxWidth < rotatedWidth) {
            const scale = maxWidth / rotatedWidth;
            rotatedWidth = roundScale(rotatedWidth, scale);
            rotatedHeight = roundScale(rotatedHeight, scale);
            imageWidth = roundScale(imageWidth, scale);
            imageHeight = roundScale(imageHeight, scale);
        }
        if (maxHeight > 0 && maxHeight < rotatedHeight) {
            const scale = maxHeight / rotatedHeight;
            rotatedWidth = roundScale(rotatedWidth, scale);
            rotatedHeight = roundScale(rotatedHeight, scale);
            imageWidth = roundScale(imageWidth, scale);
            imageHeight = roundScale(imageHeight, scale);
        }
        if (maxPixel > 0 && maxPixel < rotatedWidth * rotatedHeight) {
            const scale = Math.sqrt(maxPixel / (rotatedWidth * rotatedHeight));
            rotatedWidth = roundScale(rotatedWidth, scale);
            rotatedHeight = roundScale(rotatedHeight, scale);
            imageWidth = roundScale(imageWidth, scale);
            imageHeight = roundScale(imageHeight, scale);
        }
        if (rotatedWidth < rotatedHeight) {
            if (rotatedWidth < tileSize) {
                const r = tileSize / rotatedWidth;
                rotatedWidth = tileSize;
                rotatedHeight = roundScale(rotatedHeight, r);
                imageWidth = roundScale(imageWidth, r);
                imageHeight = roundScale(imageHeight, r);
            }
        } else {
            if (imageHeight < tileSize) {
                const r = tileSize / rotatedHeight;
                rotatedHeight = tileSize;
                rotatedWidth = roundScale(rotatedWidth, r);
                imageWidth = roundScale(imageWidth, r);
                imageHeight = roundScale(imageHeight, r);
            }
        }
        this.width_ = imageWidth;
        this.height_ = imageHeight;

        const sourceResolution = Math.max(originExtentSize[0] / imageWidth, originExtentSize[1] / imageHeight);
        const maxResolution = Math.max(gridExtentWidth, gridExtentHeight) / tileSize;
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
        if (!tileGrid) {
            this.setState(SourceState.ERROR);
            throw new Error("Unexpected error.");
        }

        this.tileGrid = tileGrid;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        if (!context || !tempContext) {
            this.setState(SourceState.ERROR);
            throw new Error("Unexpected error.");
        }
        reader.render({
            mode: this.mode_,
            cmap: this.cmap_ || undefined,
            samples: this.samples_,
            width: imageWidth,
            height: imageHeight,
            layers: this.layers_
        }).then((image) => {
            tempCanvas.width = image.width; tempCanvas.height = image.height;
            tempContext.putImageData(image, 0, 0);
            canvas.width = rotatedWidth;
            canvas.height = rotatedHeight;
            context.save();
            context.translate(rotatedWidth / 2, rotatedHeight / 2);
            context.rotate(angle);
            context.drawImage(tempCanvas, 0, 0, image.width, image.height, -image.width / 2, -image.height / 2, image.width, image.height);
            context.restore();
            this.context_ = context;
            this.setState(SourceState.READY);
        }).catch(() => {
            this.setState(SourceState.ERROR);
            throw new Error("Unexpected error.");
        });
    }
}