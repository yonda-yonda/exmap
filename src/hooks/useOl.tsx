import { Map, View } from "ol";
import "ol/ol.css";
import { defaults as defaultInteraction } from "ol/interaction";
import { defaults as defaultControls, Attribution, Control } from "ol/control";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import * as React from "react";

export interface UseOlValues {
  ref: React.RefObject<HTMLDivElement>;
  map: Map | undefined;
}

export function useOl(): UseOlValues {
  const ref = React.useRef<HTMLDivElement>(null);
  const initialized = React.useRef(false);
  const [map, setMap] = React.useState<Map>();

  React.useEffect(() => {
    if (initialized.current) return;
    const attribution = new Attribution({
      collapsible: false,
    });
    const controls: Control[] = [attribution];

    const map = new Map({
      target: ref.current || undefined,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([37.41, 8.82]),
        zoom: 4,
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
  }, []);

  return {
    ref,
    map,
  };
}
