import * as React from "react";
import { Helmet } from "react-helmet-async";
import CssBaseline from "@mui/material/CssBaseline";
import TileGrid from "ol/tilegrid/TileGrid";
import Tile from "ol/Tile";
import { XYZ } from "ol/source";
import TileLayer from "ol/layer/WebGLTile";
import ImageTile from "ol/ImageTile";

import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { useOl } from "~/hooks/useOl";
proj4.defs(
  "EPSG:3995",
  "+proj=stere +lat_0=90 +lat_ts=71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
);
register(proj4);

const maxResolution = 360 / 512;
const defaultResolutions: number[] = [];
for (let i = 0; i < 14; ++i) {
  defaultResolutions[i] = maxResolution / Math.pow(2, i + 1);
}

const Grid = (): React.ReactElement => {
  const view4326 = useOl({
    projection: "EPSG:4326",
  });
  const view3857 = useOl();
  const view3995 = useOl({
    projection: "EPSG:3995",
  });

  const size = 512;
  const canvasRef = React.useRef(document.createElement("canvas"));
  canvasRef.current.width = size;
  canvasRef.current.height = size;

  function tileLoadFunction(imageTile: Tile, coordString: string) {
    console.log(coordString);
    const [z, x, y] = coordString.split(",").map(Number);

    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    const half = size / 2;
    const lineHeight = 80;
    context.strokeStyle = "white";
    context.textAlign = "center";
    context.font = "72px sans-serif";
    context.clearRect(0, 0, size, size);
    context.fillStyle = "rgba(100, 100, 100, 0.5)";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "black";
    context.fillText(`z: ${z}`, half, half - lineHeight);
    context.fillText(`x: ${x}`, half, half);
    context.fillText(`y: ${y}`, half, half + lineHeight);
    context.strokeRect(0, 0, size, size);

    ((imageTile as ImageTile).getImage() as HTMLImageElement).src =
      canvasRef.current.toDataURL();
  }

  React.useEffect(() => {
    if (view4326.map) {
      const layer = new TileLayer({
        source: new XYZ({
          url: "{z},{x},{y}",
          tileLoadFunction,
          transition: 0,
        }),
      });
      view4326.map.addLayer(layer);
    }
  }, [view4326.map]);

  React.useEffect(() => {
    if (view3857.map) {
      const tileGrid = new TileGrid({
        extent: [-180, -90, 180, 90],
        tileSize: size,
        resolutions: defaultResolutions,
      });
      const layer = new TileLayer({
        source: new XYZ({
          projection: "EPSG:4326",
          url: "{z},{x},{y}",
          tileGrid,
          tileLoadFunction,
          transition: 0,
        }),
      });
      view3857.map.addLayer(layer);
    }
  }, [view3857.map]);

  React.useEffect(() => {
    if (view3995.map) {
      const tileGrid = new TileGrid({
        extent: [-180, -90, 180, 90],
        tileSize: size,
        resolutions: defaultResolutions,
      });
      const layer = new TileLayer({
        source: new XYZ({
          projection: "EPSG:4326",
          url: "{z},{x},{y}",
          tileGrid,
          tileLoadFunction,
          transition: 0,
        }),
      });
      view3995.map.addLayer(layer);
    }
  }, [view3995.map]);

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>Show Grid</title>
        <meta name="description" content="Show Tile Grid." />
        <link rel="canonical" href="https://yonda-yonda.github.io/exmap/grid" />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://github.githubassets.com/favicon.ico"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Helmet>
      <h1>view EPSG:4326, grid EPSG:3857</h1>
      <div
        ref={view4326.ref}
        style={{
          width: "720px",
          height: "360px",
          border: "solid 1px",
        }}
      />
      <h1>view EPSG:3857, grid EPSG:4326</h1>
      <div
        ref={view3857.ref}
        style={{
          width: "720px",
          height: "360px",
          border: "solid 1px",
        }}
      />
      <h1>view EPSG:3995, grid EPSG:4326</h1>
      <div
        ref={view3995.ref}
        style={{
          width: "720px",
          height: "360px",
          border: "solid 1px",
        }}
      />
    </>
  );
};
export default Grid;