import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  FormControl,
  FormHelperText,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Slider from "@mui/material/Slider";
import { satellite, terminator } from "geo4326";
import Feature from "ol/Feature";
import OlGeoJSON from "ol/format/GeoJSON";
import MultiLineString from "ol/geom/MultiLineString";
import MultiPolygon from "ol/geom/MultiPolygon";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector";
import MapBrowserEvent from "ol/MapBrowserEvent";
import Overlay from "ol/Overlay";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import * as React from "react";
import DatePicker from "react-datepicker";
import { Helmet } from "react-helmet-async";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { scroller } from "react-scroll";
import { twoline2satrec } from "satellite.js";

import "react-datepicker/dist/react-datepicker.css";
import { useOl } from "~/hooks/useOl";
import { validate } from "~/scripts/tle";

type Color = {
  r: number;
  g: number;
  b: number;
};

const colors: Color[] = [
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
];

const parseTLE = (value: string): [string, string] => {
  const lines = value.split(/\r\n|\n/).filter((v) => v.length > 0);

  let line1 = "";
  let line2 = "";

  if (lines.length > 2) line1 = lines[1];
  else if (lines.length > 0) line1 = lines[0];
  if (lines.length > 2) line2 = lines[2];
  else if (lines.length > 1) line2 = lines[1];
  return [line1, line2];
};

const getSatName = (value: string): string => {
  const lines = value.split(/\r\n|\n/).filter((v) => v.length > 0);

  if (lines.length > 2) return lines[0];
  return "";
};

const getStyle = (
  r: number,
  g: number,
  b: number,
  options?: {
    stroke?: boolean;
    fill?: boolean;
    image?: boolean;
    opacity?: number;
  }
): Style => {
  const { stroke, fill, image, opacity } = Object.assign(
    {
      stroke: true,
      fill: true,
      image: true,
      opacity: 0.2,
    },
    options
  );

  return new Style({
    stroke: stroke
      ? new Stroke({
          color: `rgba(${r}, ${g}, ${b}, 1)`,
          width: 2,
        })
      : undefined,
    fill: fill
      ? new Fill({
          color: `rgba(${r}, ${g}, ${b}, ${opacity})`,
        })
      : undefined,
    image: image
      ? new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: `rgba(${r}, ${g}, ${b}, 1)`,
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 1,
          }),
        })
      : undefined,
  });
};

type Input = {
  tle: string;
  start: Date;
  end: Date;
  fov: string;
  offnadir: string;
};

const now = new Date();
now.setSeconds(0);
const start = new Date(now);
const end = new Date(start);
end.setHours(end.getHours() + 6);

const defaultValues = {
  tle: "",
  start,
  end,
  fov: "0",
  offnadir: "0",
};

const Viewer = (): React.ReactElement => {
  const ol = useOl({ projection: "EPSG:4326" });
  const counterRef = React.useRef(0);
  const subSatelliteTrackLayerRef = React.useRef<VectorLayer<VectorSource>>();
  const accessAreaLayerRef = React.useRef<VectorLayer<VectorSource>>();
  const footprintLayerRef = React.useRef<VectorLayer<VectorSource>>();
  const terminatorLayerRef = React.useRef<VectorLayer<VectorSource>>();
  const tagOverlayRef = React.useRef<Overlay>();
  const conditionRef = React.useRef<
    {
      id: string;
      name: string;
      start: Date;
      end: Date;
      tle: [string, string];
      fov: number[];
      offnadir: number[];
      color: Color;
    }[]
  >([]);
  const [currentDate, setCurrentDate] = React.useState<Date>();
  const [sliderConfig, setSliderConfig] = React.useState<{
    min: number;
    max: number;
  }>();
  const [errors, setErrors] = React.useState<string[]>([]);

  const { control, watch, handleSubmit, setValue } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues,
  });

  const [showResult, setShowResult] = React.useState(false);

  const watchTLE = watch("tle");

  const orbitalElements = React.useMemo(() => {
    const [line1, line2] = parseTLE(watchTLE);
    if (!validate(line1, line2)) return [];

    const ret: {
      key: string;
      label: { ja: string; en: string };
      value: string | number;
      unit: string;
    }[] = [];
    const name = getSatName(watchTLE);
    if (name.length > 0)
      ret.push({
        key: "name",
        label: { ja: "衛星名", en: "Name" },
        value: name,
        unit: "",
      });

    const satrec = twoline2satrec(line1, line2);

    ret.push({
      key: "num",
      label: { ja: "カタログ番号", en: "Number" },
      value: satrec.satnum,
      unit: "",
    });
    // https://celestrak.org/columns/v04n03/
    // 98001.00000000 -> 1998-01-01T00:00:00.000Z
    // 98000.00000000 -> 1997-12-31T00:00:00.000Z
    // 98001.50000000 -> 1998-01-01T12:00:00.000Z
    const year = satrec.epochyr;
    const day = satrec.epochdays - 1;
    const epoch = new Date(
      (year < 57 ? "20" : "19") + ("00" + year).slice(-2) + "-01-01T00:00:00Z"
    );
    epoch.setMilliseconds(day * 1000 * 60 * 60 * 24);
    ret.push({
      key: "epoch",
      label: { ja: "元期", en: "Epoch" },
      value: epoch.toISOString(),
      unit: "",
    });

    ret.push({
      key: "bstar",
      label: { ja: "BStar", en: "BStar" },
      value: String(satrec.bstar),
      unit: "",
    });
    ret.push({
      key: "inc",
      label: { ja: "軌道傾斜角", en: "Inclination" },
      value: ((satrec.inclo * 180) / Math.PI).toFixed(4),
      unit: "deg",
    });
    ret.push({
      key: "ran",
      label: { ja: "昇交点赤径", en: "Right Ascension of Ascending Node" },
      value: ((satrec.nodeo * 180) / Math.PI).toFixed(4),
      unit: "deg",
    });
    ret.push({
      key: "ecc",
      label: { ja: "離心率", en: "Eccentricity" },
      value: satrec.ecco,
      unit: "",
    });
    ret.push({
      key: "perigee",
      label: { ja: "近地点離角", en: "Argument of Perigee" },
      value: ((satrec.argpo * 180) / Math.PI).toFixed(4),
      unit: "deg",
    });
    ret.push({
      key: "ma",
      label: { ja: "平均近点角", en: "Mean Anomaly" },
      value: ((satrec.mo * 180) / Math.PI).toFixed(4),
      unit: "deg",
    });
    ret.push({
      key: "mo",
      label: { ja: "平均運動", en: "Mean Motion" },
      value: satrec.no * (1440.0 / (2.0 * Math.PI)),
      unit: "1/day",
    });
    return ret;
  }, [watchTLE]);

  React.useEffect(() => {
    const epoch = orbitalElements.find((orbitalElement) => {
      return orbitalElement.key === "epoch";
    });
    if (epoch) {
      setValue("start", new Date(epoch.value));

      const end = new Date(epoch.value);
      end.setHours(end.getHours() + 6);
      setValue("end", end);
    }
  }, [orbitalElements, setValue]);

  const sample = React.useCallback(() => {
    setValue(
      "tle",
      "SENTINEL-2A\n1 40697U 15028A   23330.11653598 -.00000027  00000+0  63838-5 0  9993\n2 40697  98.5636  42.2887 0000923  96.4386 263.6902 14.30826055440163"
    );
    setValue("fov", "20.6");
    setValue("offnadir", "0");
  }, [setValue]);

  React.useEffect(() => {
    if (!footprintLayerRef.current) {
      footprintLayerRef.current = new VectorLayer({
        source: new VectorSource<Feature>({
          features: [],
        }),
      });
    }
    if (!subSatelliteTrackLayerRef.current) {
      subSatelliteTrackLayerRef.current = new VectorLayer({
        source: new VectorSource<Feature>({
          features: [],
        }),
      });
    }
    if (!accessAreaLayerRef.current) {
      accessAreaLayerRef.current = new VectorLayer({
        source: new VectorSource<Feature>({
          features: [],
        }),
      });
    }
    if (!terminatorLayerRef.current) {
      terminatorLayerRef.current = new VectorLayer({
        source: new VectorSource<Feature>({
          features: [],
        }),
        style: getStyle(0, 0, 0, {
          stroke: false,
          image: false,
          opacity: 0.1,
        }),
      });
    }

    ol.map?.addLayer(terminatorLayerRef.current);
    ol.map?.addLayer(accessAreaLayerRef.current);
    ol.map?.addLayer(subSatelliteTrackLayerRef.current);
    ol.map?.addLayer(footprintLayerRef.current);

    if (tagOverlayRef.current) ol.map?.removeOverlay(tagOverlayRef.current);
    const tagElement = new DOMParser().parseFromString(
      `<div style="
        margin: 0 0 0 16px;
        transform: translate(0, -50%);
        text-align: center;
        font-size: 10px;
        padding: 2px 4px;
        background-color: rgba(255, 255, 255);
        position: absolute;
        white-space: nowrap;
        pointer-events: none;"></div>`,
      "text/html"
    ).body.firstChild as HTMLElement;
    tagOverlayRef.current = new Overlay({
      element: tagElement,
    });
    ol.map?.addOverlay(tagOverlayRef.current);
    const moved = (evt: MapBrowserEvent<UIEvent>) => {
      if (evt.dragging) {
        return;
      }
      if (!tagOverlayRef.current) {
        return;
      }
      const pixel = ol.map?.getEventPixel(evt.originalEvent);
      if (pixel && footprintLayerRef.current) {
        footprintLayerRef.current.getFeatures(pixel).then((features) => {
          // The array will either contain the topmost feature when a hit was detected, or it will be empty.
          const name = features[0]?.getProperties()?.name;

          if (name) {
            const element = tagOverlayRef.current?.getElement();
            if (element) element.innerHTML = name;
            tagOverlayRef.current?.setPosition(evt.coordinate);
          } else {
            tagOverlayRef.current?.setPosition(undefined);
            const element = tagOverlayRef.current?.getElement();
            if (element) element.innerHTML = "";
          }
        });
      }
    };

    tagOverlayRef.current?.setPosition(undefined);
    ol.map?.on("pointermove", moved);

    return () => {
      if (subSatelliteTrackLayerRef.current)
        ol.map?.removeLayer(subSatelliteTrackLayerRef.current);
      if (accessAreaLayerRef.current)
        ol.map?.removeLayer(accessAreaLayerRef.current);
      if (footprintLayerRef.current)
        ol.map?.removeLayer(footprintLayerRef.current);
      if (terminatorLayerRef.current)
        ol.map?.removeLayer(terminatorLayerRef.current);

      ol.map?.un("pointermove", moved);
    };
  }, [ol.map]);

  const onSubmit: SubmitHandler<Input> = React.useCallback((data) => {
    const [line1, line2] = parseTLE(data.tle);
    setErrors([]);

    setShowResult(true);
    const fov = data.fov
      .split(",")
      .map((v) => Number(v) / 2)
      .slice(0, 2);
    const offnadir = data.offnadir
      .split(",")
      .map((v) => Number(v))
      .slice(0, 2);

    const id = data.tle + data.fov + data.offnadir;
    if (conditionRef.current.find((v) => v.id === id)) {
      setErrors((prev) => {
        if (!prev.includes("DUPLICATE")) {
          return [...prev, "DUPLICATE"];
        }
        return prev;
      });
      return;
    }
    let name = getSatName(data.tle);
    if (name.length === 0) {
      name = "satellite_" + (conditionRef.current.length + 1);
    }

    const color = { ...colors[counterRef.current++ % colors.length] };

    conditionRef.current.push({
      id,
      name,
      start: data.start,
      end: data.end,
      tle: [line1, line2],
      fov,
      offnadir,
      color,
    });

    const maxMiliSec = data.end.getTime();
    const minMiliSec = data.start.getTime();
    setSliderConfig((prev) => {
      return {
        min: Math.min(minMiliSec, prev?.min || Infinity),
        max: Math.max(maxMiliSec, prev?.max || -Infinity),
      };
    });
    setCurrentDate(data.start);

    if (subSatelliteTrackLayerRef.current) {
      const source = subSatelliteTrackLayerRef.current.getSource();
      if (source) {
        try {
          const obj = new Feature({
            geometry: new MultiLineString(
              satellite.subSatelliteTrack(line1, line2, data.start, data.end)
            ),
            name,
          });

          obj.setStyle(getStyle(color.r, color.g, color.b));

          source.addFeature(obj);
        } catch {
          setErrors((prev) => {
            if (!prev.includes("SUB_SATELLITE_TRACK")) {
              return [...prev, "SUB_SATELLITE_TRACK"];
            }
            return prev;
          });
        }
      }
    }

    if (accessAreaLayerRef.current) {
      const source = accessAreaLayerRef.current.getSource();
      if (source) {
        if (fov.length > 0) {
          try {
            const coordinates = offnadir
              .map((v) => {
                return satellite
                  .accessArea(line1, line2, data.start, data.end, {
                    roll: [v + fov[0] / 2, v - fov[0] / 2],
                  })
                  .map((c) => [c]);
              })
              .flat();

            const obj = new Feature({
              geometry: new MultiPolygon(coordinates),
              name,
            });
            obj.setStyle(
              getStyle(color.r, color.g, color.b, {
                stroke: false,
                image: false,
              })
            );
            source.addFeature(obj);
          } catch (e) {
            setErrors((prev) => {
              if (!prev.includes("ACCESS_AREA")) {
                return [...prev, "ACCESS_AREA"];
              }
              return prev;
            });
          }
        }
      }
    }
    scroller.scrollTo("result", {
      duration: 1000,
      delay: 10,
      smooth: "easeInOutQuart",
    });
  }, []);

  React.useEffect(() => {
    if (currentDate && conditionRef.current.length > 0) {
      if (footprintLayerRef.current) {
        const source = footprintLayerRef.current.getSource();
        if (source) {
          source.clear();

          const features: Feature[] = [];
          conditionRef.current.forEach((condition) => {
            try {
              const obj = new Feature({
                geometry: new Point(
                  satellite.nadir(
                    condition.tle[0],
                    condition.tle[1],
                    currentDate
                  )
                ),
                name: condition.name,
              });

              obj.setStyle(
                getStyle(
                  condition.color.r,
                  condition.color.g,
                  condition.color.b
                )
              );
              features.push(obj);
            } catch {
              setErrors((prev) => {
                if (!prev.includes("NADIR")) {
                  return [...prev, "NADIR"];
                }
                return prev;
              });
            }
            const fov = condition.fov;

            if (fov.length > 0) {
              const tle = condition.tle;
              condition.offnadir.forEach((offnadir) => {
                try {
                  const obj = new Feature({
                    geometry: new Polygon([
                      satellite.footprint(tle[0], tle[1], currentDate, {
                        fov: [fov[0], fov.length > 1 ? fov[1] : fov[0]],
                        offnadir,
                      }),
                    ]),
                    name: condition.name,
                  });
                  obj.setStyle(
                    getStyle(
                      condition.color.r,
                      condition.color.g,
                      condition.color.b
                    )
                  );
                  features.push(obj);
                } catch {
                  setErrors((prev) => {
                    const sum = fov.reduce((sum, element) => {
                      return sum + element;
                    }, 0);
                    if (sum !== 0 && !prev.includes("FOOTPRINT")) {
                      return [...prev, "FOOTPRINT"];
                    }
                    return prev;
                  });
                }
              });
            }
          });
          source.addFeatures(features);
        }
      }
      if (terminatorLayerRef.current) {
        const source = terminatorLayerRef.current.getSource();
        if (source) {
          source.clear();
          source.addFeature(
            new OlGeoJSON({
              featureProjection: "EPSG:4326",
            }).readFeature(terminator.night(currentDate)) as Feature
          );
          source.addFeature(
            new OlGeoJSON({
              featureProjection: "EPSG:4326",
            }).readFeature(
              terminator.night(currentDate, { elevation: "civil" })
            ) as Feature
          );
          source.addFeature(
            new OlGeoJSON({
              featureProjection: "EPSG:4326",
            }).readFeature(
              terminator.night(currentDate, { elevation: "nautical" })
            ) as Feature
          );
          source.addFeature(
            new OlGeoJSON({
              featureProjection: "EPSG:4326",
            }).readFeature(
              terminator.night(currentDate, { elevation: "astronomical" })
            ) as Feature
          );
        }
      }
    }
  }, [currentDate]);

  const reset = React.useCallback(() => {
    setShowResult(false);
    setCurrentDate(undefined);
    setSliderConfig(undefined);
    conditionRef.current = [];
    terminatorLayerRef.current?.getSource()?.clear();
    footprintLayerRef.current?.getSource()?.clear();
    accessAreaLayerRef.current?.getSource()?.clear();
    subSatelliteTrackLayerRef.current?.getSource()?.clear();
  }, []);

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>Draw Satellite Position</title>
        <meta name="description" content="Draw satellite positione on map." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/picture"
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
        <meta name="twitter:title" content="Draw Satellite Position" />
        <meta
          name="twitter:description"
          content="衛星の位置や軌跡を地図上に表示します"
        />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/satellite"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_satellite.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Draw Satellite Position
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item md={8} xs={12}>
              <Stack spacing={1}>
                <Box>
                  <Controller
                    control={control}
                    name="tle"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormControl
                        component="fieldset"
                        error={invalid}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="TLE"
                          multiline
                          rows={3}
                          error={invalid}
                        />
                        {error?.type === "required" && (
                          <FormHelperText sx={{ mx: 0 }}>
                            Required. <br />
                            必須です。入力してください。
                          </FormHelperText>
                        )}
                        {error?.type === "validate" && (
                          <FormHelperText sx={{ mx: 0 }}>
                            Not matched TLE pattern.
                            <br />
                            TLEの形式が正しくありません。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                      validate: (value) => {
                        const [line1, line2] = parseTLE(value);
                        return validate(line1, line2);
                      },
                    }}
                  />
                </Box>
                <Box sx={{ zIndex: 2 }}>
                  <Typography component="p" variant="caption">
                    Start Datetime
                  </Typography>
                  <Controller
                    control={control}
                    name="start"
                    rules={{
                      required: true,
                    }}
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { invalid, error },
                    }) => (
                      <FormControl
                        component="div"
                        error={invalid}
                        sx={{ display: "block" }}
                      >
                        <DatePicker
                          onChange={onChange}
                          onBlur={onBlur}
                          selected={value}
                          showTimeSelect
                          dateFormat="yyyy/MM/dd hh:mm aa"
                        />
                        {error?.type === "required" && (
                          <FormHelperText sx={{ mx: 0 }}>
                            Required. <br />
                            必須です。入力してください。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
                <Box sx={{ zIndex: 1 }}>
                  <Typography component="p" variant="caption">
                    End Datetime
                  </Typography>
                  <Controller
                    control={control}
                    name="end"
                    rules={{
                      required: true,
                      validate: (value, formValues) => {
                        const end = value;
                        const start = formValues.start;

                        return !start || start < end;
                      },
                    }}
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { invalid, error },
                    }) => (
                      <FormControl
                        component="div"
                        error={invalid}
                        sx={{ display: "block" }}
                      >
                        <DatePicker
                          onChange={onChange}
                          onBlur={onBlur}
                          selected={value}
                          showTimeSelect
                          dateFormat="yyyy/MM/dd hh:mm aa"
                        />
                        {error?.type === "required" && (
                          <FormHelperText sx={{ mx: 0 }}>
                            Required. <br />
                            必須です。入力してください。
                          </FormHelperText>
                        )}
                        {error?.type === "validate" && (
                          <FormHelperText sx={{ mx: 0 }}>
                            End datetime must be after Start datetime. <br />
                            日時の大小関係が正しくありません。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
                <Box pt={2} sx={{ zIndex: 0 }}>
                  <Controller
                    control={control}
                    name="fov"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormControl
                        component="fieldset"
                        error={invalid}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          size="small"
                          label="Sensor Fov [deg]"
                          error={invalid}
                        />
                        {error?.type === "pattern" && (
                          <FormHelperText sx={{ mx: 0 }}>
                            must be positive number.
                            <br />
                            正数を入力してください。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      pattern: /^(\d*\.?\d*)(,\s*(\d+\.?\d*)*)*$/,
                    }}
                  />
                </Box>
                <Box pt={2} sx={{ zIndex: 0 }}>
                  <Controller
                    control={control}
                    name="offnadir"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormControl
                        component="fieldset"
                        error={invalid}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          size="small"
                          label="Offnadir angle [deg]"
                          error={invalid}
                        />
                        {error?.type === "pattern" && (
                          <FormHelperText sx={{ mx: 0 }}>
                            must be number.
                            <br />
                            数値を入力してください。
                          </FormHelperText>
                        )}
                        {error?.types?.min && (
                          <FormHelperText sx={{ mx: 0 }}>
                            must be greater than -90.
                            <br />
                            -90より大きい数値を入力してください。
                          </FormHelperText>
                        )}
                        {error?.types?.max && (
                          <FormHelperText sx={{ mx: 0 }}>
                            must be must be less than 90.
                            <br />
                            90より小さい数値を入力してください。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      pattern: /^-?(\d*\.?\d*)(,\s*-?(\d*\.?\d*)*)*$/,
                      validate: {
                        min: (v) => {
                          return (
                            v
                              .split(",")
                              .slice(0, 2)
                              .map((v) => Number(v))
                              .filter((v) => {
                                return v < -90;
                              }).length === 0
                          );
                        },
                        max: (v) => {
                          return (
                            v
                              .split(",")
                              .slice(0, 2)
                              .map((v) => Number(v))
                              .filter((v) => {
                                return v > 90;
                              }).length === 0
                          );
                        },
                      },
                    }}
                  />
                </Box>
              </Stack>
              <Box sx={{ my: 4 }}>
                <Button variant="outlined" onClick={sample} size="small">
                  set sample
                </Button>
              </Box>
            </Grid>
            <Grid item md={4} xs={12}>
              {orbitalElements.map((orbitalElement) => {
                return (
                  <Box
                    key={orbitalElement.key}
                    component="dl"
                    sx={{ margin: 0 }}
                  >
                    <Typography
                      variant="subtitle2"
                      component="dt"
                      sx={{ borderBottom: "solid 1px" }}
                    >
                      {orbitalElement.label.ja}/{orbitalElement.label.en}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      component="dd"
                      sx={{ marginBottom: "10px" }}
                    >
                      {orbitalElement.value}{" "}
                      {orbitalElement.unit.length > 0 &&
                        `[${orbitalElement.unit}]`}
                    </Typography>
                  </Box>
                );
              })}
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={2} direction="row">
                <Button variant="contained" type="submit" size="large">
                  Show
                </Button>
                {showResult && (
                  <Button variant="outlined" size="large" onClick={reset}>
                    Reset
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </form>

        <div id="result">
          <Box my={4} style={{ display: showResult ? "block" : "none" }}>
            <Box style={{ position: "relative" }}>
              <div
                ref={ol.ref}
                style={{
                  width: "100%",
                  height: "480px",
                }}
              />
            </Box>
            {currentDate && (
              <Box sx={{ mt: 1 }}>
                <Slider
                  key={new Date().toDateString()}
                  valueLabelDisplay="off"
                  min={sliderConfig?.min}
                  max={sliderConfig?.max}
                  value={currentDate.getTime()}
                  step={1000 * 60}
                  onChange={(_: Event, newValue: number | number[]) => {
                    if (!Array.isArray(newValue))
                      setCurrentDate(new Date(newValue));
                  }}
                />
                <Box>{new Date(currentDate).toISOString()}</Box>
              </Box>
            )}
            {errors.length > 0 && (
              <Box>
                <FormControl error={true}>
                  {errors.includes("NADIR") && (
                    <FormHelperText sx={{ mx: 0 }}>
                      failed calcurating nadir.
                      <br />
                      直下点の計算に失敗しました。
                    </FormHelperText>
                  )}
                  {errors.includes("FOOTPRINT") && (
                    <FormHelperText sx={{ mx: 0 }}>
                      failed calcurating footprint.
                      <br />
                      フットプリントの計算に失敗しました。
                    </FormHelperText>
                  )}
                  {errors.includes("ACCESS_AREA") && (
                    <FormHelperText sx={{ mx: 0 }}>
                      failed calcurating access area.
                      <br />
                      アクセスエリアの計算に失敗しました。
                    </FormHelperText>
                  )}
                  {errors.includes("SUB_SATELLITE_TRACK") && (
                    <FormHelperText sx={{ mx: 0 }}>
                      failed calcurating subsatellite track.
                      <br />
                      軌跡の計算に失敗しました。
                    </FormHelperText>
                  )}
                  {errors.includes("DUPLICATE") && (
                    <FormHelperText sx={{ mx: 0 }}>
                      duplicated satellite information.
                      <br />
                      衛星の情報が重複しています。
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
            )}
          </Box>
        </div>
      </Container>
    </>
  );
};
export default Viewer;
