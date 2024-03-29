import { Map, View } from "ol";
import "ol/ol.css";
import { defaults as defaultControls, Attribution, Control } from "ol/control";
import { defaults as defaultInteraction } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import { fromLonLat, get as getProjection, transform } from "ol/proj";
import OSM from "ol/source/OSM";
import * as React from "react";

export interface UseOlProps {
  center?: number[];
  zoom?: number;
  basemap?: boolean;
  projection?: string;
}

export interface UseOlValues {
  ref: React.RefObject<HTMLDivElement>;
  map: Map | undefined;
  changeProjection: (code: string) => void;
}

export function useOl(props?: UseOlProps): UseOlValues {
  const {
    center = fromLonLat([0, 0]),
    zoom = 1,
    basemap = true,
    projection,
  } = { ...props };

  const initialized = React.useRef(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<Map>();

  React.useEffect(() => {
    if (initialized.current || !ref.current) return;
    const attribution = new Attribution({
      collapsible: false,
    });
    const controls: Control[] = [attribution];
    const map = new Map({
      target: ref.current,
      layers: basemap
        ? [
            new TileLayer({
              source: new OSM(),
            }),
          ]
        : [],
      view: new View({
        center,
        zoom,
        projection,
      }),
      interactions: defaultInteraction({
        altShiftDragRotate: false,
        pinchRotate: false,
      }),
      controls: defaultControls({
        attribution: false,
        zoom: false,
        rotate: false,
      }).extend(controls),
    });
    setMap(map);
    initialized.current = true;
  }, [center, zoom, basemap, projection]);

  const changeProjection = React.useCallback(
    (code: string) => {
      if (map) {
        const view = map.getView();
        const prevProjection = view.getProjection();
        const prevCode = prevProjection?.getCode();
        if (code !== prevCode) {
          const projection = getProjection(code);
          if (projection) {
            const center = view.getCenter();
            map.setView(
              new View({
                center: transform(center ?? [0, 0], prevCode, code),
                zoom: view.getZoom() || 0,
                projection,
              })
            );
          }
        }
      }
    },
    [map]
  );

  return {
    ref,
    map,
    changeProjection,
  };
}
