import { Map, View } from "ol";
import "ol/ol.css";
import { defaults as defaultInteraction } from "ol/interaction";
import { defaults as defaultControls, Attribution, Control } from "ol/control";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import * as React from "react";

export interface UseOlProps {
  center?: [number, number];
  zoom?: number;
}

export interface UseOlValues {
  ref: React.RefObject<HTMLDivElement>;
  map: Map | undefined;
}

export function useOl(props?: UseOlProps): UseOlValues {
  const { center = fromLonLat([0, 0]), zoom = 1 } = { ...props };

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
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center,
        zoom,
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
  }, [center, zoom]);

  return {
    ref,
    map,
  };
}
