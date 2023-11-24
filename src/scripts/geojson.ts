import { utils } from "geo4326";

import type {
  GeoJSON,
  Feature,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  GeoJsonObject,
} from "geojson";

export const parsedLinearRing = (data: string): number[][] | null => {
  try {
    const json = JSON.parse(
      data.replace(/\r?\n/g, "").replace(/\s+/g, "").replace(/],]$/g, "]]")
    );
    if (Array.isArray(json)) {
      json.forEach(p => {
        if (!Array.isArray(p)) throw new Error();
        p.forEach(v => {
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
  } catch {
    return null;
  }
  return null;
};

export const getPolygon = (geojson: GeoJSON): Polygon | null => {
  switch (geojson?.type) {
    case "Polygon": {
      return geojson;
    }
    case "MultiPolygon": {
      return {
        type: "Polygon",
        coordinates: geojson.coordinates[0],
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
      break;
    }
  }
  return null;
};

type Crs = {
  crs?: {
    type?: string;
    properties?: {
      name?: string;
    };
  };
};

type GeometryWithCRS = (
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon
) &
  Crs;

export type FeatureWithCRS = Feature<GeometryWithCRS> & Crs;

type FeatureCollectionWithCRS = {
  type: "FeatureCollection";
  features: Array<FeatureWithCRS>;
} & GeoJsonObject &
  Crs;

type GeometryCollectionWithCRS = {
  type: "GeometryCollection";
  geometries: Array<GeometryWithCRS>;
} & GeoJsonObject &
  Crs;

export type GeoJSONWithCRS =
  | GeometryWithCRS
  | FeatureWithCRS
  | FeatureCollectionWithCRS
  | GeometryCollectionWithCRS;

const _getEPSG = (
  geojson: GeoJSONWithCRS | null,
  geometryTypes: string[]
): { type: string | null; code: number | null } => {
  const getCode = (geojson: GeoJSONWithCRS): number | null => {
    const crs = geojson?.crs?.properties?.name;
    const code = crs && crs.replace(/^.*EPSG::/, "");
    return code ? parseInt(code, 10) : null;
  };
  if (geojson) {
    if (geometryTypes.includes(geojson?.type || "")) {
      return {
        type: geojson.type || null,
        code: getCode(geojson),
      };
    }
    switch (geojson?.type) {
      case "Feature": {
        const child = _getEPSG(geojson?.geometry, geometryTypes);
        if (child.code !== null) return child;
        if (geometryTypes.includes(child?.type || "")) {
          const parentCode = getCode(geojson);
          return {
            type: child.type || null,
            code: parentCode,
          };
        }
        break;
      }
      case "FeatureCollection": {
        for (let i = 0; i < geojson.features.length; i++) {
          const child = _getEPSG(geojson?.features[i], geometryTypes);
          if (geometryTypes.includes(child?.type || "")) {
            if (child.code !== null) {
              return child;
            }

            const parentCode = getCode(geojson);
            return {
              type: child.type,
              code: parentCode,
            };
          }
        }
        break;
      }
      case "GeometryCollection": {
        for (let i = 0; i < geojson.geometries.length; i++) {
          const child = _getEPSG(geojson?.geometries[i], geometryTypes);
          if (geometryTypes.includes(child?.type || "")) {
            if (child.code !== null) {
              return child;
            }

            const parentCode = getCode(geojson);
            return {
              type: child.type || null,
              code: parentCode,
            };
          }
        }
        break;
      }
    }
  }
  return {
    type: geojson?.type || null,
    code: null,
  };
};

export const getEPSGcode = (
  geojson: GeoJSONWithCRS,
  geometryTypes: string[]
): number | null => {
  /**
   * crs member is removed officaly.
   * GeoJSON coordinates is using WGS84(EPSG:4326).
   * https://datatracker.ietf.org/doc/html/rfc7946#section-4
   */
  const epsg = _getEPSG(geojson, geometryTypes);
  if (geometryTypes.includes(epsg?.type || "")) {
    return epsg.code === null ? 4326 : epsg.code;
  }
  return null;
};
