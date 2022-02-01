import * as React from "react";
import { Helmet } from "react-helmet-async";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, Typography } from "@mui/material";
import XYZ from "ol/source/XYZ";
import { useOl } from "~/hooks/useOl";
import TileLayer from "ol/layer/Tile";
import { toLonLat } from "ol/proj";
import MapBrowserEvent from "ol/MapBrowserEvent";

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
const deg2tile = (
  lon: number,
  lat: number,
  zoom: number,
  options?: {
    min?: number;
    max?: number;
  }
) => {
  const { min, max } = Object.assign({}, options);
  let z = min && min > zoom ? min : max && max < zoom ? max : zoom;
  z = z > 0 ? Math.ceil(z) : 0;
  return {
    x: Math.floor(((lon + 180) / 360) * Math.pow(2, z)),
    y: Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, z)
    ),
    z,
  };
};
const tile2deg = (x: number, y: number, z: number) => {
  // タイルの左上のlon,lat
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return [
    (x / Math.pow(2, z)) * 360 - 180,
    (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
  ];
};

const deg2pixel = (
  lon: number,
  lat: number,
  tile: {
    x: number;
    y: number;
    z: number;
  },
  size = 256
) => {
  if (![256, 512].includes(size)) throw new Error("unexpected tile size.");
  const lefttopLonLat = tile2deg(tile.x, tile.y, tile.z);
  const target = deg2tile(lon, lat, tile.z + (size === 512 ? 9 : 8));
  const lefttop = deg2tile(
    lefttopLonLat[0],
    lefttopLonLat[1],
    tile.z + (size === 512 ? 9 : 8)
  );
  return [target.x - lefttop.x, target.y - lefttop.y];
};

const getPixelValue = (
  image: HTMLImageElement,
  x: number,
  y: number
): number[] => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    return Array.from(context.getImageData(x, y, 1, 1).data);
  } else {
    throw new Error("can't get value.");
  }
};

const dsm = (rgb: number[], u = 100) => {
  // https://maps.gsi.go.jp/development/demtile.html
  let hyoko = Math.floor(rgb[0] * 256 * 256 + rgb[1] * 256 + rgb[2]);
  if (hyoko == 8388608) return NaN;
  if (hyoko > 8388608) hyoko = (hyoko - 16777216) / u;
  if (hyoko < 8388608) hyoko = hyoko / u;
  return hyoko;
};

const Picker = (): React.ReactElement => {
  const viewer = useOl({ basemap: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const demLayer = React.useRef<TileLayer<any>>();
  const resultRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clicked = (evt: MapBrowserEvent<any>) => {
      if (demLayer.current && resultRef.current) {
        let zoom = evt.map.getView().getZoom();
        const lonlat = toLonLat(evt?.coordinate);
        if (zoom && lonlat.length > 1) {
          try {
            const source = demLayer.current.getSource();
            while (zoom >= 0) {
              const xyzCoord = deg2tile(lonlat[0], lonlat[1], zoom, {
                min: 0,
                max: 8,
              });
              const image: HTMLImageElement = source
                .getTile(xyzCoord.z, xyzCoord.x, xyzCoord.y)
                .getImage();

              // ロードされてないときはsrcが空
              if (image.src.length > 0) {
                const pixel = deg2pixel(
                  lonlat[0],
                  lonlat[1],
                  xyzCoord,
                  image.width
                );
                resultRef.current.innerText = `lon: ${lonlat[0].toFixed(
                  4
                )}[deg], lat: ${lonlat[1].toFixed(4)}[deg], height: ${dsm(
                  getPixelValue(image, pixel[0], pixel[1])
                )}[m]`;
                break;
              }
              zoom--;
            }
            if (zoom < 0) throw new Error("can't get image.");
          } catch (e) {
            console.log(e);
            resultRef.current.innerText = "";
          }
        }
      }
    };

    if (viewer.map) {
      if (!demLayer.current) {
        demLayer.current = new TileLayer({
          source: new XYZ({
            maxZoom: 8,
            url: "https://cyberjapandata.gsi.go.jp/xyz/demgm_png/{z}/{x}/{y}.png",
            attributions:
              "国土地理院(https://maps.gsi.go.jp/development/ichiran.html)",
            tilePixelRatio:
              window && window.devicePixelRatio ? window.devicePixelRatio : 1,
            crossOrigin: "anonymous", // 設定し忘れるとcanvasで値が取れない
          }),
        });

        viewer.map.addLayer(demLayer.current);
      }

      viewer.map.getViewport().style.cursor = "pointer";
      viewer.map.on("singleclick", clicked);
    }
    return () => {
      if (viewer.map) {
        viewer.map.un("singleclick", clicked);
      }
    };
  }, [viewer.map]);

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>Picker</title>
        <meta name="description" content="Pick tile values." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/picker"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://github.githubassets.com/favicon.ico"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pick tile values" />
        <meta
          name="twitter:description"
          content="クリックした位置のタイルの値を取得します。"
        />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/picker"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_picker.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Pick tile values
        </Typography>
        <div
          ref={viewer.ref}
          style={{
            width: "100%",
            height: "520px",
          }}
        />
        <Typography variant="body1" ref={resultRef}></Typography>
      </Container>
    </>
  );
};
export default Picker;
