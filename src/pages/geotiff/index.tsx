import * as React from "react";
import { Helmet } from "react-helmet-async";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { Map } from "ol";
import { toSize } from "ol/size";
import ImageTile from "ol/ImageTile";
import Tile from "ol/Tile";
import { WebGLTile } from "ol/layer";
import XYZ from "ol/source/XYZ";
import * as GeoTIFFSource from "ol/source/GeoTIFF";
import TileState from "ol/TileState";
import SourceState from "ol/source/State";
import { get as getProjection, Projection, transformExtent } from "ol/proj";
import MousePosition from "ol/control/MousePosition";
import { register as olRegister } from "ol/proj/proj4";
import proj4 from "proj4";
import { utils } from "geo4326";
import { useOl } from "~/hooks/useOl";
import { useDnDSort } from "~/hooks/useDnDSort";

const EllipsisWrapper = styled("div")({
  overflow: "hidden",
});

const EllipsisTypography = styled(Typography)({
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

const LayerName = styled(EllipsisWrapper)({
  flex: "1 1 auto",
});

const LayerButton = styled("div")({
  flex: "0 0 auto",
});

const StyledUl = styled("ul")({
  listStyle: "none",
  margin: 0,
  padding: 0,
  "& > li": {
    marginTop: "5px",
    "&:firstChild": {
      marginTop: 0,
    },
  },
});

type Input = {
  sources: {
    url: string;
    bands: string;
    nodata: string;
    min: string;
    max: string;
  }[];
};

type SourceConfBase = {
  nodata: number;
  bands: number[];
  min: number;
  max: number;
};

type SourceConf = {
  url: string;
  name: string;
} & SourceConfBase;

type SubmitProps = {
  id: string;
  sources: SourceConf[];
};

type FormError =
  | "FailedLoadSource"
  | "Duplicate"
  | "UnmatchBands"
  | "NotFoundCrs"
  | "UnsupportedCrs";

type LayerError = "FailedLoadTile";
type LayerConf = {
  layer: WebGLTile;
  error: LayerError | null;
  id: string;
  sources: SourceConf[];
} & SubmitProps;

const defaultSourcesValue = {
  url: "",
  bands: "1,2,3",
  nodata: "0",
  min: "0",
  max: "255",
};

const Coordinates = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  padding: "2px 4px",
  fontSize: 10,
  pointerEvents: "none",
});

const Viewer = (): React.ReactElement => {
  const ol = useOl();
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const positionRef = React.useRef<HTMLDivElement | null>(null);
  const [layerConfs, setLayerConfs] = React.useState<LayerConf[]>([]);
  const [error, setError] = React.useState<FormError | null>(null);
  const [loading, setLoading] = React.useState<boolean>();

  const layerList = useDnDSort<LayerConf>({
    defaultItems: [],
    mode: "topbottom",
    drop: (draged, hovered) => {
      if (draged.index !== hovered.index)
        setLayerConfs(prevList => {
          if (
            hovered.index < 0 ||
            draged.index < 0 ||
            draged.index > prevList.length - 1 ||
            hovered.index > prevList.length - 1
          ) {
            return prevList;
          }

          const nextList = [...prevList];
          const target = nextList[draged.index];
          nextList.splice(draged.index, 1);
          nextList.splice(hovered.index, 0, target);
          return nextList;
        });
    },
  });

  const { control, handleSubmit, reset, setValue } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      sources: [defaultSourcesValue],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "sources",
    control,
  });

  const removeLayer = React.useCallback(
    (id: string) => {
      setLayerConfs(layerConfs => {
        const newLayerConfs = [...layerConfs];
        const index = newLayerConfs.findIndex(layerConf => {
          return id === layerConf.id;
        });
        const target = newLayerConfs[index];
        if (target) {
          if (ol.map) {
            ol.map.removeLayer(target.layer);

            newLayerConfs.splice(index, 1);
            return newLayerConfs;
          }
        }
        return newLayerConfs;
      });
    },
    [ol.map]
  );
  const setLayerError = React.useCallback(
    (id: string, errorType: LayerError) => {
      setLayerConfs(layerConfs => {
        const newLayerConfs = [...layerConfs];
        const index = newLayerConfs.findIndex(layerConf => {
          return id === layerConf.id;
        });
        const target = newLayerConfs[index];
        if (target && target.error !== errorType) {
          target.error = errorType;
          return newLayerConfs;
        }
        return layerConfs;
      });
    },
    []
  );

  const resetList = layerList.reset;
  React.useEffect(() => {
    let zIndex = 0;
    layerConfs.forEach(({ layer }) => {
      layer.setZIndex(zIndex++);
    });

    resetList([...layerConfs]);
  }, [layerConfs, resetList]);

  const setLayer = React.useCallback(
    async (
      map: Map,
      source: GeoTIFFSource.default,
      id: string,
      sources: SourceConf[]
    ) => {
      /*
        refer to https://github.com/openlayers/openlayers/issues/13197
      */
      const sourceView = await source.getView();
      const sourceProjection = sourceView?.projection;
      if (!(sourceProjection instanceof Projection)) {
        setError("NotFoundCrs");
        return;
      }
      const code = sourceProjection.getCode();

      if (!getProjection(code)) {
        try {
          const crs = utils.getCrs(code);
          proj4.defs(code, crs);
        } catch {
          setError("UnsupportedCrs");
          return;
        }
        olRegister(proj4);
      }
      const tileGrid = source.getTileGrid();
      if (tileGrid) {
        const imageSource = new XYZ({
          tileGrid: tileGrid,
          url: "{z},{x},{y}",
          interpolate: false,
          tileLoadFunction: function (imageTile: Tile, coordString: string) {
            const coord = coordString.split(",").map(Number);
            const tile = source.getTile(
              coord[0],
              coord[1],
              coord[2],
              1,
              sourceProjection
            );

            const setImage = function () {
              const tilesize = toSize(tileGrid.getTileSize(coord[0]));
              const canvas = document.createElement("canvas");
              canvas.width = tilesize[0];
              canvas.height = tilesize[1];
              const context = canvas.getContext("2d");
              if (!context) return;
              const imgData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );

              const pixels = imgData.data;
              const data = tile.getData();
              if (data instanceof DataView) return;
              const l = data.length;
              for (let i = 0; i < l; i++) {
                pixels[i] = data[i];
              }
              context.putImageData(imgData, 0, 0);
              ((imageTile as ImageTile).getImage() as HTMLImageElement).src =
                canvas.toDataURL();
            };

            const tileState = tile.getState();
            if (tileState === TileState.LOADED) {
              setImage();
            } else {
              const tileListener = () => {
                const tileState = tile.getState();
                if (tileState !== TileState.LOADING) {
                  tile.removeEventListener("change", tileListener);

                  if (tileState === TileState.LOADED) {
                    setImage();
                  }
                  if (tileState === TileState.ERROR) {
                    setLayerError(id, "FailedLoadTile");
                  }
                }
              };
              tile.addEventListener("change", tileListener);
              tile.load();
            }
          },
          projection: sourceProjection,
        });

        const layer = new WebGLTile({
          source: imageSource,
        });
        map.addLayer(layer);
        setLayerConfs(layerConfs => {
          return [
            ...layerConfs,
            {
              id,
              layer,
              sources,
              error: null,
            },
          ];
        });

        const originExtent = sourceView.extent;
        if (originExtent) {
          let extent = originExtent;
          if (code !== "EPSG:3857") {
            const transformed = transformExtent(
              originExtent,
              code,
              "EPSG:3857"
            );

            if (transformed[0] > transformed[2])
              transformed[2] += proj4(code, "EPSG:3857", [180, 0])[0] * 2;

            extent = transformed;
          }
          map.getView().fit(extent, {
            padding: [40, 20, 40, 20],
            maxZoom: 20,
          });
        }
      }
    },
    [setLayerError]
  );

  const load = React.useCallback(
    ({ sources, id }: SubmitProps) => {
      setLoading(true);
      const source = new GeoTIFFSource.default({
        sources,
      });

      const sourceState = source.getState();
      if (sourceState === SourceState.READY) {
        if (ol.map) setLayer(ol.map, source, id, sources);
        setLoading(false);
      } else {
        const sourceListener = () => {
          const sourceState = source.getState();
          if (sourceState === SourceState.ERROR) {
            source.removeEventListener("change", sourceListener);
            setError("FailedLoadSource");
            setLoading(false);
          }
          if (sourceState === SourceState.READY) {
            source.removeEventListener("change", sourceListener);
            if (ol.map) setLayer(ol.map, source, id, sources);
            setLoading(false);
          }
        };
        source.addEventListener("change", sourceListener);
      }
    },
    [ol.map, setLayer]
  );

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    data => {
      let id = "";
      let bandLength = 0;
      const sources: SourceConf[] = [];
      for (let i = 0; i < data.sources.length; i++) {
        const source = data.sources[i];
        const bands = source.bands.split(",").map(v => {
          return parseInt(v, 10);
        });
        bandLength += bands.length;

        const min = parseFloat(source.min);
        const max = parseFloat(source.max);
        const nodata = parseFloat(source.nodata);

        const url = source.url;
        const addedId = url;
        sources.push({
          url,
          name: url.split("/").pop() || "",
          bands,
          min,
          max,
          nodata,
        });
        if (addedId.length > 0) {
          id +=
            addedId +
            "_" +
            bands.join("") +
            "_" +
            source.min +
            "_" +
            source.max +
            "_" +
            source.nodata;
        }
      }

      if (sources.length === 1 && bandLength === 1) {
        const band = sources[0].bands[0];
        sources[0].bands = [band, band, band];
      } else if (bandLength !== 3) {
        setError("UnmatchBands");
        return;
      }

      const index = layerConfs.findIndex(layerConf => {
        return id === layerConf.id;
      });
      if (index >= 0) {
        setError("Duplicate");
        return;
      }
      load({
        id,
        sources,
      });
    },
    [load, layerConfs]
  );

  React.useEffect(() => {
    if (loading === false) {
      reset();
    }
  }, [loading, reset]);

  const sample1 = React.useCallback(() => {
    setValue("sources", [
      {
        url: "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/2020/S2A_36QWD_20200701_0_L2A/TCI.tif",
        bands: "1,2,3",
        nodata: "0",
        min: "0",
        max: "255",
      },
    ]);
    setError(null);
  }, [setValue, setError]);

  const sample2 = React.useCallback(() => {
    setValue("sources", [
      {
        url: "https://landsat-pds.s3.amazonaws.com/c1/L8/139/045/LC08_L1TP_139045_20170304_20170316_01_T1/LC08_L1TP_139045_20170304_20170316_01_T1_B4.TIF",
        bands: "1",
        nodata: "0",
        min: "1",
        max: "15978",
      },
      {
        url: "https://landsat-pds.s3.amazonaws.com/c1/L8/139/045/LC08_L1TP_139045_20170304_20170316_01_T1/LC08_L1TP_139045_20170304_20170316_01_T1_B3.TIF",
        bands: "1",
        nodata: "0",
        min: "1",
        max: "15239",
      },
      {
        url: "https://landsat-pds.s3.amazonaws.com/c1/L8/139/045/LC08_L1TP_139045_20170304_20170316_01_T1/LC08_L1TP_139045_20170304_20170316_01_T1_B2.TIF",
        bands: "1",
        nodata: "0",
        min: "1",
        max: "14947",
      },
    ]);
    setError(null);
  }, [setValue, setError]);

  React.useEffect(() => {
    let mousePositionControl: MousePosition | null = null;

    if (ol.map && positionRef.current) {
      mousePositionControl = new MousePosition({
        coordinateFormat: coords => {
          if (coords)
            return `lon: ${coords[0].toFixed(4)}, lat: ${coords[1].toFixed(4)}`;
          return "";
        },
        projection: "EPSG:4326",
        className: "",
        target: positionRef.current,
      });
      ol.map.addControl(mousePositionControl);
    }
    return () => {
      if (ol.map && mousePositionControl) {
        ol.map.removeControl(mousePositionControl);
      }
    };
  }, [ol.map]);

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>Display Remote GeoTIFF</title>
        <meta name="description" content="Display Remote GeoTIFF on map." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/geotiff"
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
        <meta name="twitter:title" content="Display Remote GeoTIFF" />
        <meta
          name="twitter:description"
          content="???????????????GeoTIFF??????????????????"
        />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/geotiff"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_geotiff.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Display Remote GeoTIFF
        </Typography>
        <Stack my={4} spacing={4}>
          <div>
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <div style={{ position: "relative" }} ref={wrapperRef}>
                  <div
                    ref={ol.ref}
                    style={{
                      width: "100%",
                      height: "340px",
                    }}
                  />
                  <Coordinates ref={positionRef}></Coordinates>
                </div>
              </Grid>
              <Grid item xs={3}>
                {layerConfs.length > 0 ? (
                  <StyledUl>
                    {layerList.items.map(item => {
                      return (
                        <li key={item.key} ref={item.ref} {...item.trigger}>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <LayerName>
                              {item.value.sources.map((source, i) => {
                                return (
                                  <Tooltip
                                    key={i}
                                    title={
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        {...item.propagation}
                                      >
                                        {source.name}
                                        <br />
                                        bands: {source.bands.join(",")}
                                        <br />
                                        range:{" "}
                                        {`${source.min} to ${source.max}`}
                                        <br />
                                        nodata: {source.nodata}
                                        {source.url}
                                      </Typography>
                                    }
                                    arrow
                                    placement="left"
                                  >
                                    <EllipsisTypography variant="body2">
                                      {source.name}
                                    </EllipsisTypography>
                                  </Tooltip>
                                );
                              })}
                              {item.value.error === "FailedLoadTile" && (
                                <Typography variant="caption" display="block">
                                  Failed to load tiles. <br />
                                  ????????????????????????????????????????????????
                                </Typography>
                              )}
                            </LayerName>
                            <LayerButton {...item.propagation}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  removeLayer(item.value.id);
                                }}
                              >
                                REMOVE
                              </Button>
                            </LayerButton>
                          </Stack>
                        </li>
                      );
                    })}
                  </StyledUl>
                ) : (
                  <Typography>Nothing to display.</Typography>
                )}
              </Grid>
            </Grid>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <div>
                  <Button
                    variant="outlined"
                    onClick={sample1}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    sample 1
                  </Button>
                  <Button variant="outlined" onClick={sample2} size="small">
                    sample 2
                  </Button>
                </div>
                {fields.map((field, index) => {
                  return (
                    <div key={field.id}>
                      <Controller
                        control={control}
                        name={`sources.${index}.url`}
                        render={({ field, fieldState: { invalid, error } }) => (
                          <FormControl
                            component="fieldset"
                            error={invalid}
                            fullWidth
                          >
                            <TextField
                              {...field}
                              label="url"
                              size="small"
                              error={invalid}
                              placeholder="https://"
                              disabled={loading}
                            />
                            {error?.type === "required" && (
                              <FormHelperText>
                                Required. <br />
                                ??????????????????????????????????????????
                              </FormHelperText>
                            )}
                            {error?.type === "pattern" && (
                              <FormHelperText>
                                Not matched URL pattern.
                                <br />
                                URL???????????????????????????????????????
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                        rules={{
                          required: true,
                          pattern: /^(https?):\/\/[^ "]+$/,
                        }}
                      />
                      <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 1 }}>
                        <Controller
                          control={control}
                          name={`sources.${index}.bands`}
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
                            <FormControl
                              component="fieldset"
                              error={invalid}
                              fullWidth
                            >
                              <TextField
                                {...field}
                                label="bands"
                                size="small"
                                error={invalid}
                                placeholder="1,2,3"
                                disabled={loading}
                              />
                              {error?.type === "required" && (
                                <FormHelperText>
                                  Required. <br />
                                  ??????????????????????????????????????????
                                </FormHelperText>
                              )}
                              {error?.type === "pattern" && (
                                <FormHelperText>
                                  Must be positive numbers(maximum of three)
                                  separated by commas.
                                  <br />
                                  ???????????????????????????????????????3????????????????????????????????????
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                          rules={{
                            required: true,
                            pattern:
                              /^\s*([1-9]\d*){1,}(\s*,\s*([1-9]\d*)){0,2}\s*$/,
                          }}
                        />
                        <Controller
                          control={control}
                          name={`sources.${index}.nodata`}
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
                            <FormControl
                              component="fieldset"
                              error={invalid}
                              fullWidth
                            >
                              <TextField
                                {...field}
                                label="nodata"
                                size="small"
                                error={invalid}
                                disabled={loading}
                              />
                              {error?.type === "required" && (
                                <FormHelperText>
                                  Required. <br />
                                  ??????????????????????????????????????????
                                </FormHelperText>
                              )}
                              {error?.type === "pattern" && (
                                <FormHelperText>
                                  must be a number. <br />
                                  ????????????????????????????????????
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                          rules={{
                            required: true,
                            pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                          }}
                        />
                        <Controller
                          control={control}
                          name={`sources.${index}.min`}
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
                            <FormControl
                              component="fieldset"
                              error={invalid}
                              fullWidth
                            >
                              <TextField
                                {...field}
                                label="min"
                                size="small"
                                error={invalid}
                                disabled={loading}
                              />
                              {error?.type === "required" && (
                                <FormHelperText>
                                  Required. <br />
                                  ??????????????????????????????????????????
                                </FormHelperText>
                              )}
                              {error?.type === "pattern" && (
                                <FormHelperText>
                                  must be a number. <br />
                                  ????????????????????????????????????
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                          rules={{
                            required: true,
                            pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                          }}
                        />
                        <Controller
                          control={control}
                          name={`sources.${index}.max`}
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
                            <FormControl
                              component="fieldset"
                              error={invalid}
                              fullWidth
                            >
                              <TextField
                                {...field}
                                label="max"
                                size="small"
                                error={invalid}
                                disabled={loading}
                              />
                              {error?.type === "required" && (
                                <FormHelperText>
                                  Required. <br />
                                  ??????????????????????????????????????????
                                </FormHelperText>
                              )}
                              {error?.type === "pattern" && (
                                <FormHelperText>
                                  must be a number. <br />
                                  ????????????????????????????????????
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                          rules={{
                            required: true,
                            pattern: /^((\+|-){0,1}[1-9]\d*|0)(\.\d+)?$/,
                          }}
                        />
                      </Stack>

                      <div>
                        {index > 0 && (
                          <IconButton
                            color="primary"
                            size="small"
                            aria-label="Delete"
                            component="span"
                            onClick={() => {
                              remove(index);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                        {index === fields.length - 1 && index < 2 && (
                          <IconButton
                            color="primary"
                            size="small"
                            aria-label="Add"
                            component="span"
                            onClick={() => {
                              append(defaultSourcesValue);
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Stack>

              <FormControl error={!!error} sx={{ mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    type="submit"
                    onClick={() => {
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Add Layer
                  </Button>
                </div>
                {error === "FailedLoadSource" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Failed to load source. <br />
                    ???????????????????????????????????????????????????
                  </FormHelperText>
                )}
                {error === "Duplicate" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Duplicate Layer. <br />
                    ????????????????????????????????????????????????
                  </FormHelperText>
                )}
                {error === "UnmatchBands" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Number of Bands must be 3. <br />
                    ????????????????????????3??????????????????????????????????????????
                  </FormHelperText>
                )}
                {error === "NotFoundCrs" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Not found CRS. <br />
                    ??????????????????????????????????????????????????????????????????????????????
                  </FormHelperText>
                )}
                {error === "UnsupportedCrs" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Unsupported CRS. <br />
                    ?????????????????????????????????????????????????????????????????????
                  </FormHelperText>
                )}
              </FormControl>
            </form>
          </div>
        </Stack>
      </Container>
    </>
  );
};
export default Viewer;
