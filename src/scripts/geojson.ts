import { utils } from "geo4326";

import type { GeoJSON, Polygon } from "geojson";

export const parsedLinearRing = (data: string): number[][] | undefined => {
    try {
        const json = JSON.parse(data.replace(/\r?\n/g, "").replace(/\s+/g, "").replace(/],]$/g, "]]"));
        if (Array.isArray(json)) {
            json.forEach((p) => {
                if (!Array.isArray(p)) throw new Error();
                p.forEach((v) => {
                    if (typeof v !== "number") throw new Error();
                });
            });

            if (
                json[0][0] !== json[json.length - 1][0] ||
                json[0][1] !== json[json.length - 1][1]
            ) {
                json.push(json[0]);
            }
            if (json.length < 4) throw new Error();

            if (!utils.isCcw(json)) {
                json.reverse();
            }

            return json;
        }
        return;
    } catch {
        return;
    }
};


export const getPolygon = (geojson: GeoJSON): Polygon | undefined => {
    switch (geojson?.type) {
        case "Polygon": {
            return geojson;
        }
        case "MultiPolygon": {
            return {
                type: "Polygon",
                coordinates: geojson.coordinates[0]
            };
        }
        case "Feature": {
            return getPolygon(geojson.geometry);
        }
        case "FeatureCollection": {
            for (let i = 0; i < geojson.features.length; i++) {
                const item = getPolygon(geojson.features[i]);
                if (item) return item;
            }
            break;
        }
        case "GeometryCollection": {
            for (let i = 0; i < geojson.geometries.length; i++) {
                const item = getPolygon(geojson.geometries[i]);
                if (item) return item;
            }
        }
    }

    return;
}