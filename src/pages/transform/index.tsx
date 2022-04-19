import * as React from "react";
import { Helmet } from "react-helmet-async";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  Switch,
  Tooltip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { scroller } from "react-scroll";
import { View } from "ol";
import OlGeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { utils, transform } from "geo4326";
import type { Feature } from "geojson";

import { useOl } from "~/hooks/useOl";
import {
  parsedLinearRing,
  getPolygon,
  getEPSGcode,
  GeoJSONWithCRS,
} from "~/scripts/geojson";
import { download } from "~/scripts/file";
import sampleGeoJSON from "~/assets/transform_sample.json";

type Input = {
  code: string;
  coordinates: string;
  partition: string;
  split: boolean;
};

type TransformError = {
  type: "code" | "coordinates" | "transform" | "display";
};

const Transform = (): React.ReactElement => {
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
      code: "",
      coordinates: "",
      partition: "0",
      split: false,
    },
  });

  const rawInput = watch();
  const prevInput = React.useRef<string>();
  const [transformError, setTransformError] =
    React.useState<TransformError | null>(null);
  const [transformed, setTransformed] = React.useState<Feature | null>();

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
      const projection = getProjection("EPSG:4326");
      if (!distLayer.current && projection) {
        distLayer.current = new VectorLayer({
          source: new VectorSource({}),
        });

        result.map.addLayer(distLayer.current);
        result.map.setView(
          new View({
            projection,
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
        });
        source.addFeature(feature);
        const polygon = feature.getGeometry()?.getExtent();
        polygon &&
          preview.map.getView().fit(polygon, {
            padding: [40, 20, 40, 20],
            maxZoom: 20,
          });
      } catch {
        return;
      }
    }
  }, [rawInput, preview.map]);

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    data => {
      if (distLayer.current) {
        const source = distLayer.current.getSource();
        source.clear();
      }

      const code = `EPSG:${data.code}`;

      let crs: string;
      try {
        crs = utils.getCrs(code);
      } catch {
        setTransformError({ type: "code" });
        return;
      }

      const coordinates = parsedLinearRing(data.coordinates);
      if (!coordinates) {
        setTransformError({ type: "coordinates" });
        return;
      }
      try {
        const feature = transform.geojsonFromLinearRing(coordinates, crs, {
          partition: parseInt(data.partition, 10),
          expand: !data.split,
        });
        setTransformed(feature);
        scroller.scrollTo("result", {
          duration: 1500,
          delay: 300,
          smooth: "easeInOutQuart",
        });
      } catch {
        setTransformError({ type: "transform" });
        return;
      }
      setTransformError(null);
    },
    [setTransformError, setTransformed]
  );

  React.useEffect(() => {
    if (result.map && distLayer.current) {
      try {
        const source = distLayer.current.getSource();
        source.clear();

        const feature = new OlGeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:4326",
        }).readFeature(transformed);
        source.addFeature(feature);

        const extent = transformed?.bbox
          ? transformed.bbox
          : [-180, -90, 180, 90];
        if (extent[0] > extent[2]) extent[2] += 360;

        result.map.getView().fit(extent, {
          padding: [40, 20, 40, 20],
          maxZoom: 20,
        });
      } catch {
        setTransformError({
          type: "display",
        });
      }
    }
  }, [result.map, transformed, setTransformError]);

  const exportFile = React.useCallback(() => {
    if (!transformed) return;
    download(JSON.stringify(transformed), "transformed.geojson", "text/json");
  }, [transformed]);

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
        <title>Transform to EPSG:4326</title>
        <meta
          name="description"
          content="Transform Polygon and export GeoJSON."
        />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/transform"
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
        <meta name="twitter:title" content="Transform to EPSG:4326" />
        <meta
          name="twitter:description"
          content="様々な投影座標系のポリゴンをEPSG:4326のGeoJSONに変換します。"
        />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/transform"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_transform.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Transform to EPSG:4326
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
                    <Controller
                      control={control}
                      name="code"
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormControl error={invalid} fullWidth>
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
                              Must be number. <br />
                              数値を入力してください。
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
                          <FormControl error={invalid} fullWidth>
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
                          parse: data => !!parsedLinearRing(data),
                          selfintersection: data => {
                            const points = parsedLinearRing(data);
                            return points
                              ? !utils.selfintersection(points)
                              : true;
                          },
                        },
                      }}
                    />
                    <Controller
                      control={control}
                      name="partition"
                      render={({ field, fieldState: { invalid, error } }) => (
                        <Tooltip
                          title={
                            <span>
                              The number of points to be inserted between
                              vertices during the transformation.
                              <br />
                              変換時に頂点間に挿入する点の数を指定します。
                            </span>
                          }
                          arrow
                          placement={middle ? "right" : "top"}
                        >
                          <FormControl error fullWidth sx={{ mb: 2 }}>
                            <TextField
                              {...field}
                              label="Insertion Points"
                              type="number"
                              size="small"
                              error={invalid}
                              InputProps={{
                                inputProps: {
                                  max: 20,
                                  min: 0,
                                },
                              }}
                            />
                            {error?.type === "min" && (
                              <FormHelperText>
                                Must be gte 0. <br />
                                0以上の値を入力してください。
                              </FormHelperText>
                            )}
                            {error?.type === "max" && (
                              <FormHelperText>
                                Must be lte 20. <br />
                                20以下の値を入力してください。
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Tooltip>
                      )}
                      rules={{
                        min: 0,
                        max: 20,
                      }}
                    />
                    <Controller
                      control={control}
                      name="split"
                      render={({ field }) => (
                        <Tooltip
                          title={
                            <span>
                              Polygon crossing the antemerdian will be split.
                              <br />
                              180度線をまたぐ図形ではポリゴンを分割します。
                            </span>
                          }
                          arrow
                          placement={middle ? "right" : "top"}
                        >
                          <FormControl fullWidth sx={{ ml: 1 }}>
                            <FormControlLabel
                              {...field}
                              control={<Switch size="small" />}
                              label="Split when crossing the antemerdian."
                            />
                          </FormControl>
                        </Tooltip>
                      )}
                    />
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
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <FormControl
                    error={!!transformError}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    <Button variant="contained" type="submit">
                      Transform
                    </Button>
                    {transformError?.type === "code" && (
                      <FormHelperText>
                        Nonexistent Projection Code. <br />
                        存在しないEPSGコードです。
                      </FormHelperText>
                    )}
                    {transformError?.type === "coordinates" && (
                      <FormHelperText>
                        Invalid Coordinates. <br />
                        無効なポリゴンです。
                      </FormHelperText>
                    )}
                    {transformError?.type === "transform" && (
                      <FormHelperText>
                        Failed Transform. <br />
                        変換に失敗しました。
                      </FormHelperText>
                    )}
                    {transformError?.type === "display" && (
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

          {transformed && (
            <section id="result">
              <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                Output
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    multiline
                    label="GeoJSON of EPSG:4326"
                    rows={12}
                    value={JSON.stringify(transformed, null, 2)}
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
                      height: "340px",
                    }}
                  />
                </Grid>
              </Grid>
            </section>
          )}
        </Stack>
      </Container>
    </>
  );
};
export default Transform;
