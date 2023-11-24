import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  RadioGroup,
  Radio,
  Switch,
  Tooltip,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/system";
import { utils, simplify } from "geo4326";
import { View } from "ol";
import OlFeature from "ol/Feature";
import OlGeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import VectorSource from "ol/source/Vector";
import proj4 from "proj4";
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { scroller } from "react-scroll";

import type { Polygon } from "geojson";

import ImageRdp from "~/assets/rdp.png";
import sampleGeoJSON from "~/assets/simplify_sample.json";
import ImageVw from "~/assets/vw.png";
import { useOl } from "~/hooks/useOl";
import { download } from "~/scripts/file";
import {
  parsedLinearRing,
  getPolygon,
  getEPSGcode,
  FeatureWithCRS,
  GeoJSONWithCRS,
} from "~/scripts/geojson";

type Input = {
  code: string;
  coordinates: string;
  method: string;
  threshold: string;
  limit: boolean;
  max: string;
};

type SimplifyError = {
  type: "code" | "coordinates" | "simplify" | "display";
};

const SampleImage = styled("div")({
  background: "white",
  "& img": {
    maxHeight: "240px",
  },
});

const Simplify = (): React.ReactElement => {
  const theme = useTheme();
  const middle = useMediaQuery(theme.breakpoints.up("md"));

  const preview = useOl();
  const result = useOl();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputLayer = React.useRef<VectorLayer<any>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const distLayer = React.useRef<VectorLayer<any>>();
  // https://github.com/openlayers/openlayers/issues/12497

  const { control, watch, handleSubmit, setValue } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      code: "4326",
      coordinates: "",
      method: "vw",
      threshold: "0.001",
      limit: false,
      max: "10",
    },
  });

  const rawInput = watch();
  const prevInput = React.useRef<string>();
  const [simplifyError, setSimplifyError] =
    React.useState<SimplifyError | null>(null);
  const [simplified, setSimplified] = React.useState<FeatureWithCRS | null>();
  const [inputLength, setInputLength] = React.useState<number | null>();

  React.useEffect(() => {
    if (preview.map) {
      if (!inputLayer.current) {
        inputLayer.current = new VectorLayer({
          source: new VectorSource({}),
        });

        preview.map.addLayer(inputLayer.current);
      }
    }
  }, [preview.map]);

  React.useEffect(() => {
    if (result.map) {
      if (!distLayer.current) {
        distLayer.current = new VectorLayer({
          source: new VectorSource({}),
        });

        result.map.addLayer(distLayer.current);
        result.map.setView(
          new View({
            projection: "EPSG:4326",
            center: [0, 0],
            zoom: 1,
          })
        );
      }
    }
  }, [result.map]);

  React.useEffect(() => {
    if (
      preview.map &&
      inputLayer.current &&
      prevInput.current !== JSON.stringify(rawInput)
    ) {
      if (rawInput.code.length === 0 || rawInput.coordinates.length === 0)
        return;

      const coordinates = parsedLinearRing(rawInput.coordinates);
      if (!rawInput.code.match(/^[0-9]{1,}$/) || !coordinates) return;

      prevInput.current = JSON.stringify(rawInput);
      const code = `EPSG:${rawInput.code}`;
      const currentCode = preview.map.getView().getProjection().getCode();

      try {
        if (code !== currentCode) {
          if (!getProjection(code)) {
            const crs = utils.getCrs(code);

            proj4.defs(code, crs);
            register(proj4);
          }

          const projection = getProjection(code);
          if (projection)
            preview.map.setView(
              new View({
                projection,
                center: [0, 0],
                zoom: 1,
              })
            );
        }
      } catch {
        return;
      }

      try {
        const source = inputLayer.current.getSource();
        source.clear();

        const feature = new OlGeoJSON({
          dataProjection: code,
          featureProjection: code,
        }).readFeature({
          type: "Polygon",
          coordinates: [coordinates],
        }) as OlFeature;
        source.addFeature(feature);
        const extent = feature.getGeometry()?.getExtent();
        extent &&
          preview.map.getView().fit(extent, {
            padding: [40, 20, 40, 20],
            maxZoom: 20,
          });

        setInputLength(coordinates.length);
      } catch {
        setInputLength(null);
      }
    }
  }, [rawInput, preview.map]);

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    (data) => {
      if (distLayer.current) {
        const source = distLayer.current.getSource();
        source.clear();
      }

      const code = data.code;
      try {
        utils.getCrs(`EPSG:${code}`);
      } catch {
        setSimplifyError({ type: "code" });
        return;
      }
      const coordinates = parsedLinearRing(data.coordinates);
      if (!coordinates) {
        setSimplifyError({ type: "coordinates" });
        return;
      }
      try {
        const method = data.method;
        const threshold = parseFloat(data.threshold);
        const max = data.limit ? parseInt(data.max, 10) : Infinity;

        let ring: number[][];
        switch (method) {
          case "rdp": {
            ring = simplify.rdp(coordinates, {
              threshold,
              limit: max,
            });
            break;
          }
          default: {
            ring = simplify.vw(coordinates, {
              threshold,
              rate: true,
              limit: max,
            });
          }
        }
        const polygon: Polygon = {
          type: "Polygon",
          coordinates: [ring],
        };
        const feature: FeatureWithCRS = {
          type: "Feature",
          properties: {},
          geometry: polygon,
        };
        if (code !== "4326") {
          feature.crs = {
            type: "name",
            properties: { name: `urn:ogc:def:crs:EPSG::${code}` },
          };
        }
        const xs = polygon.coordinates[0].map((v) => {
          return v[0];
        });
        const ys = polygon.coordinates[0].map((v) => {
          return v[1];
        });
        feature.bbox = [
          Math.min(...xs),
          Math.min(...ys),
          Math.max(...xs),
          Math.max(...ys),
        ];

        setSimplified(feature);
        scroller.scrollTo("result", {
          duration: 1500,
          delay: 300,
          smooth: "easeInOutQuart",
        });
      } catch {
        setSimplifyError({ type: "simplify" });
        return;
      }
      setSimplifyError(null);
    },
    [setSimplifyError, setSimplified]
  );

  React.useEffect(() => {
    if (result.map && distLayer.current && simplified) {
      try {
        const source = distLayer.current.getSource();
        source.clear();
        const code = getEPSGcode(sampleGeoJSON as GeoJSONWithCRS, [
          "Polygon",
          "MultiPolygon",
        ]);
        const feature = new OlGeoJSON({
          dataProjection: `EPSG:${code}`,
          featureProjection: `EPSG:${code}`,
        }).readFeature(simplified);
        source.addFeature(feature);

        const extent = simplified?.bbox;
        if (extent) {
          result.map.getView().fit(extent, {
            padding: [40, 20, 40, 20],
            maxZoom: 20,
          });
        }
      } catch {
        setSimplifyError({
          type: "display",
        });
      }
    }
  }, [result.map, simplified, setSimplifyError]);

  const exportFile = React.useCallback(() => {
    if (!simplified) return;
    download(JSON.stringify(simplified), "simplified.geojson", "text/json");
  }, [simplified]);

  const sample = React.useCallback(() => {
    const code = getEPSGcode(sampleGeoJSON as GeoJSONWithCRS, [
      "Polygon",
      "MultiPolygon",
    ]);
    const coordinates = getPolygon(
      sampleGeoJSON as GeoJSONWithCRS
    )?.coordinates;

    if (code && Array.isArray(coordinates)) {
      setValue("code", String(code));
      setValue("coordinates", JSON.stringify(coordinates[0]));
    }
  }, [setValue]);

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>Simplify Polygon</title>
        <meta
          name="description"
          content="Simplify polygon by removing points."
        />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/simplify"
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
        <meta name="twitter:title" content="Simplify Polygon" />
        <meta name="twitter:description" content="ポリゴンを簡略化します。" />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/simplify"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_simplify.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Simplify Polygon
        </Typography>
        <Stack my={4} spacing={8}>
          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Input
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <Stack spacing={3}>
                    <div>
                      <Controller
                        control={control}
                        name="code"
                        render={({ field, fieldState: { invalid, error } }) => (
                          <FormControl
                            component="fieldset"
                            error={invalid}
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            <TextField
                              {...field}
                              label="Projection Code"
                              error={invalid}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    EPSG:
                                  </InputAdornment>
                                ),
                              }}
                            />
                            {error?.type === "required" && (
                              <FormHelperText>
                                Required. <br />
                                必須です。入力してください。
                              </FormHelperText>
                            )}
                            {error?.type === "pattern" && (
                              <FormHelperText>
                                Must be Integer. <br />
                                整数を入力してください。
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                        rules={{
                          required: true,
                          pattern: /^[0-9]{1,}$/,
                        }}
                      />
                      <Controller
                        control={control}
                        name="coordinates"
                        render={({ field, fieldState: { invalid, error } }) => (
                          <div>
                            <FormControl
                              component="fieldset"
                              error={invalid}
                              fullWidth
                            >
                              <TextField
                                {...field}
                                error={invalid}
                                label="Coordinates"
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="[[0,0],[1,0],[1,1],[0,1],[0,0]]"
                              />
                              {error?.type === "required" && (
                                <FormHelperText>
                                  Required. <br />
                                  必須です。入力してください。
                                </FormHelperText>
                              )}
                              {error?.type === "parse" && (
                                <FormHelperText>
                                  Wrong format. <br />
                                  座標の配列(3点以上)を入力してください。
                                </FormHelperText>
                              )}
                              {error?.type === "selfintersection" && (
                                <FormHelperText>
                                  not allow self-intersection. <br />
                                  自己交差しています。
                                </FormHelperText>
                              )}
                            </FormControl>
                            <Button
                              variant="outlined"
                              onClick={sample}
                              size="small"
                              sx={{ mt: 1 }}
                            >
                              set sample
                            </Button>
                          </div>
                        )}
                        rules={{
                          required: true,
                          validate: {
                            parse: (data) => !!parsedLinearRing(data),
                            selfintersection: (data) => {
                              const points = parsedLinearRing(data);
                              return points
                                ? !utils.selfintersection(points)
                                : true;
                            },
                          },
                        }}
                      />
                    </div>
                    <Controller
                      control={control}
                      name="method"
                      render={({ field }) => (
                        <FormControl
                          component="fieldset"
                          fullWidth
                          sx={{ mb: 2 }}
                        >
                          <FormLabel component="legend">
                            <Typography variant="subtitle2" component="span">
                              method
                            </Typography>
                          </FormLabel>
                          <RadioGroup {...field}>
                            <FormControlLabel
                              value="vw"
                              control={<Radio size="small" />}
                              label="Visvalingam Whyatt"
                            />
                            <FormControlLabel
                              value="rdp"
                              control={<Radio size="small" />}
                              label="Ramer Douglas Peucker"
                            />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                    <Controller
                      control={control}
                      name="threshold"
                      render={({ field, fieldState: { invalid, error } }) => (
                        <Tooltip
                          title={
                            <SampleImage>
                              {rawInput.method === "rdp" ? (
                                <img
                                  src={ImageRdp}
                                  alt="Eliminate point when `d < threshold`."
                                />
                              ) : (
                                <img
                                  src={ImageVw}
                                  alt="Eliminate point when `part < threshold * whole`."
                                />
                              )}
                            </SampleImage>
                          }
                          arrow
                          placement={middle ? "right-end" : "top"}
                        >
                          <FormControl
                            component="fieldset"
                            fullWidth
                            sx={{ ml: 1 }}
                          >
                            <TextField
                              {...field}
                              label="threshold"
                              error={invalid}
                            />
                            {error?.type === "required" && (
                              <FormHelperText>
                                Required. <br />
                                必須です。入力してください。
                              </FormHelperText>
                            )}
                            {error?.type === "pattern" && (
                              <FormHelperText>
                                must be a number larger than zero. <br />
                                0以上の数値を入力してください。
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Tooltip>
                      )}
                      rules={{
                        required: true,
                        pattern: /^([1-9]\d*|0)(\.\d+)?$/,
                      }}
                    />
                    <div>
                      <Controller
                        control={control}
                        name="limit"
                        render={({ field }) => (
                          <FormControl fullWidth sx={{ ml: 1 }}>
                            <FormControlLabel
                              {...field}
                              control={<Switch size="small" />}
                              label="Limit the number of points"
                            />
                          </FormControl>
                        )}
                      />

                      {rawInput.limit && (
                        <Controller
                          control={control}
                          name="max"
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
                            <FormControl component="fieldset" fullWidth>
                              <TextField
                                {...field}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      max
                                    </InputAdornment>
                                  ),
                                }}
                                error={invalid}
                              />
                              {error?.type === "required" && (
                                <FormHelperText>
                                  Required. <br />
                                  必須です。入力してください。
                                </FormHelperText>
                              )}
                              {error?.type === "min" && (
                                <FormHelperText>
                                  must be a number larger than zero.
                                  <br />
                                  0以上の数値を入力してください。
                                </FormHelperText>
                              )}
                              {error?.type === "pattern" && (
                                <FormHelperText>
                                  Must be Integer. <br />
                                  整数を入力してください。
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                          rules={
                            rawInput.limit && {
                              required: true,
                              min: 4,
                              pattern: /^[0-9]{1,}$/,
                            }
                          }
                        />
                      )}
                    </div>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={7}>
                  <div
                    ref={preview.ref}
                    style={{
                      width: "100%",
                      height: "340px",
                    }}
                  />
                  {inputLength && (
                    <Typography>Origin: {inputLength} points.</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <FormControl error={!!simplifyError} fullWidth sx={{ mb: 2 }}>
                    <Button variant="contained" type="submit">
                      Simplify
                    </Button>
                    {simplifyError?.type === "code" && (
                      <FormHelperText>
                        Nonexistent Projection Code. <br />
                        存在しないEPSGコードです。
                      </FormHelperText>
                    )}
                    {simplifyError?.type === "coordinates" && (
                      <FormHelperText>
                        Invalid Coordinates. <br />
                        無効なポリゴンです。
                      </FormHelperText>
                    )}
                    {simplifyError?.type === "simplify" && (
                      <FormHelperText>
                        Failed Simplify. <br />
                        簡略化に失敗しました。
                      </FormHelperText>
                    )}
                    {simplifyError?.type === "display" && (
                      <FormHelperText>
                        Failed Display. <br />
                        地図への表示に失敗しました。
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </section>

          <div id="result">
            {simplified && (
              <section>
                <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                  Output
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      multiline
                      label="GeoJSON"
                      rows={12}
                      value={JSON.stringify(simplified, null, 2)}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<FileDownloadIcon />}
                      onClick={exportFile}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Export
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <div
                      ref={result.ref}
                      style={{
                        width: "100%",
                        height: "320px",
                      }}
                    />
                    {Array.isArray(simplified.geometry.coordinates[0]) && (
                      <Typography>
                        Simplified: {simplified.geometry.coordinates[0].length}{" "}
                        points.
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </section>
            )}
          </div>
        </Stack>
      </Container>
    </>
  );
};
export default Simplify;
