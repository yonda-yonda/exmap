import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as React from "react";

export interface UseMlProps {
  center?: [number, number];
  zoom?: number;
  globe?: boolean;
}

export interface UseMlValues {
  ref: React.RefObject<HTMLDivElement>;
  map: maplibregl.Map | undefined;
}

export function useMl(props?: UseMlProps): UseMlValues {
  const { center = [0, 0], zoom = 1, globe = true } = { ...props };

  const initialized = React.useRef(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<maplibregl.Map>();

  React.useEffect(() => {
    if (initialized.current || !ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      center,
      zoom,
      style: {
        version: 8,
        sources: {
          rtile: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
          },
        },
        layers: [
          {
            id: "basemap",
            type: "raster",
            source: "rtile",
            minzoom: 0,
            maxzoom: 18,
          },
        ],
      },
    });
    if (globe) {
      map.on("style.load", () => {
        map.setProjection({
          type: "globe",
        });
      });
    }
    setMap(map);
    initialized.current = true;
  }, [center, zoom, globe]);

  return {
    ref,
    map,
  };
}
