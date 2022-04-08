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
import { AttributionLike } from "ol/source/Source";
import ImageTile from "ol/ImageTile";
import Tile from "ol/Tile";
import TileImage from "ol/source/TileImage";
import TileGrid from "ol/tilegrid/TileGrid";
import { Projection, get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { utils } from "geo4326";
import { Reader, Layer } from "./Reader";

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

export type RegionalProps = {
    urls?: string[];
    files?: File[];
    sources: SourceConfig[];
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
    private bbox_: number[] | null;
    private reader_: Reader;
    private width_: number;
    private height_: number;
    private samples_: SampleConfig[];
    private layers_: Layer[];
    constructor(userOptions: RegionalProps) {
        const options = userOptions || {};

        const tileSize = options.tileSize ? options.tileSize : DEFAULT_TILE_SIZE;
        const interpolate =
            options.interpolate !== undefined ? options.interpolate : true;

        const tileLoadFunction =
            (imageTile: Tile, coordString: string) => {
                const [z, x, y] = coordString.split(",").map(Number);
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!this.bbox_ || !context) {
                    imageTile.setState(TileState.ERROR);
                    return;
                }
                canvas.width = tileSize;
                canvas.height = tileSize;

                const window = getWindow(this.bbox_, z, x, y);
                const tileLeft = window[0];
                const tileRight = window[2];
                const tileTop = window[1];
                const tileBottom = window[3];
                const [
                    imageExtentLeft, imageExtentBottom, imageExtentRight, imageExtentTop
                ] = this.bbox_;

                const sourcePerPixel = [(imageExtentRight - imageExtentLeft) / this.width_, (imageExtentTop - imageExtentBottom) / this.height_];
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
                (async () => {
                    const image = await this.reader_.render({
                        mode: "rgb",
                        samples: this.samples_.map((sample) => {
                            return {
                                window: sourceRect,
                                ...sample
                            }
                        }),
                        width: tileSize,
                        height: tileSize,
                        layers: this.layers_
                    });
                    context.putImageData(image, 0, 0);
                    const src = canvas.toDataURL();
                    ((imageTile as ImageTile).getImage() as HTMLImageElement).src = src;

                })();
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
        this.bbox_ = null;
        this.width_ = 0;
        this.height_ = 0;

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

        this.setup(this.reader_, this.samples_, {
            tileSize,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom
        })
    }

    getBoundingBox(): number[] | null {
        return this.bbox_;
    }

    private async setup(reader: Reader, samples: SampleConfig[], options: {
        tileSize: number,
        minZoom?: number,
        maxZoom?: number,
    }) {
        let code: string | null = null;
        let unit: string | null = null;
        let imageWidth = 0;
        let imageHeight = 0;
        let bbox: number[] = []
        for (let i = 0; i < samples.length; i++) {
            if (i === 0) {
                code = await reader.getCode(samples[0].index);
                unit = await reader.getUnit(samples[0].index);
                const image = await reader.getImage(samples[0].index);
                bbox = image?.getBoundingBox() || [];
                imageWidth = image?.getWidth() || 1;
                imageHeight = image?.getHeight() || 1;
            }
            else {
                if (code !== await reader.getCode(samples[i].index)) {
                    this.setState(SourceState.ERROR);
                    throw new Error("Unmatched code.");
                }
                if (unit !== await reader.getUnit(samples[i].index)) {
                    this.setState(SourceState.ERROR);
                    throw new Error("Unmatched unit.");
                }

                const image = await reader.getImage(samples[i].index);
                const currentBbox = image?.getBoundingBox() || [];
                bbox.forEach((v, i) => {
                    if (v !== currentBbox[i]) {
                        this.setState(SourceState.ERROR);
                        throw new Error("Unmatched coordinates.");
                    }
                })
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
        this.width_ = imageWidth;
        this.height_ = imageHeight;

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
        if (!projection) {
            this.setState(SourceState.ERROR);
            throw new Error("Unsupported projection.");
        }
        this.projection = projection;
        this.bbox_ = bbox;
        const bboxWidth = this.bbox_[2] - this.bbox_[0];
        const bboxHeight = this.bbox_[3] - this.bbox_[1];
        if (
            bboxWidth <= 0 || bboxHeight <= 0
        ) {
            this.setState(SourceState.ERROR);
            throw new Error("Invalid extent.");
        }

        const sourceResolution = Math.max(
            bboxWidth / imageWidth,
            bboxHeight / imageHeight
        );
        const extentWidth = bboxWidth;
        const extentHeight = bboxHeight;
        const maxResolution = Math.max(extentWidth, extentHeight) / options.tileSize;
        const tileGrid = new TileGrid({
            extent: this.bbox_,
            tileSize: options.tileSize,
            minZoom: options.minZoom,
            resolutions: resolutionsFromExtent(this.bbox_, {
                maxZoom: options.maxZoom,
                tileSize: options.tileSize,
                maxResolution,
                sourceResolution,
            }),
        });
        if (!tileGrid) {
            this.setState(SourceState.ERROR);
            throw new Error("Unexpected Error.");
        }
        this.tileGrid = tileGrid;
        this.setState(SourceState.READY);
    }
}