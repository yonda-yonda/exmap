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
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/system";

// import { toSize } from "ol/size";
// import ImageTile from "ol/ImageTile";
// import Tile from "ol/Tile";
// import XYZ from "ol/source/XYZ";
// import TileState from "ol/TileState";
import { transformExtent } from "ol/proj"; //get as getProjection, Projection,
// import { register as olRegister } from "ol/proj/proj4";
import proj4 from "proj4";
// import { utils } from "geo4326";
import SourceState from "ol/source/State";
import { WebGLTile } from "ol/layer";

import { useOl } from "~/hooks/useOl";
import { useDnDSort } from "~/hooks/useDnDSort";
import { Regional } from "~/scripts/GeotiffGrid/Regional";

// import * as CustomGeoTIFFSource from "~/scripts/CustomGeoTIFF";

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

type FormError = "SourceNumber" | "SourceError" | "Duplicate";

interface SourceConf {
  file: string;
  nodata: number;
  band: number;
  min: number;
  max: number;
}

interface LayerConf {
  layer: WebGLTile;
  sources: SourceConf[];
  id: string;
}

const defaultSourcesValue = {
  index: "",
  band: "1",
  nodata: "0",
  min: "0",
  max: "255",
};

interface Input {
  sources: {
    index: string;
    band: string;
    nodata: string;
    min: string;
    max: string;
  }[];
}

const Coordinates = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  padding: "2px 4px",
  fontSize: 10,
  pointerEvents: "none",
});

const FileInputWrapper = styled("dl")({
  margin: "0 0 50px",
  "&>dt": {
    fontSize: "14px",
    margin: "0 0 5px",
  },
  "&>dd": {
    margin: 0,
  },
});

const Config = styled("div")({
  marginBottom: "20px",
});

const Buttons = styled("ul")({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  "&>*": {
    marginRight: "10px",
  },
});

const LayerDetail = styled("div")({
  marginLeft: "20px",
});

const Viewer = (): React.ReactElement => {
  const ol = useOl();
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const positionRef = React.useRef<HTMLDivElement | null>(null);
  const [layerConfs, setLayerConfs] = React.useState<LayerConf[]>([]);
  const [filelist, setFilelist] = React.useState<File[]>([]);
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

  const { control, handleSubmit, reset } = useForm<Input>({
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

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    data => {
      if (![1, 3].includes(data.sources.length)) {
        setError("SourceNumber");
        return;
      }
      let id = "";
      const sourceConfigs: SourceConf[] = [];
      for (let i = 0; i < data.sources.length; i++) {
        const source = data.sources[i];
        const addedId = filelist[Number(source.index)].name;

        if (addedId.length > 0) {
          id +=
            addedId +
            "_" +
            source.band +
            "_" +
            source.min +
            "_" +
            source.max +
            "_" +
            source.nodata;
        }

        sourceConfigs.push({
          file: filelist[Number(source.index)].name || "",
          min: Number(source.min),
          max: Number(source.max),
          band: Number(source.band),
          nodata: Number(source.nodata),
        });
      }
      const index = layerConfs.findIndex(layerConf => {
        return id === layerConf.id;
      });
      if (index >= 0) {
        setError("Duplicate");
        return;
      }
      if (!ol.map) return;
      const sources =
        data.sources.length === 3
          ? [...data.sources]
          : [data.sources[0], data.sources[0], data.sources[0]];

      setLoading(true);
      const source = new Regional({
        files: filelist,
        sources: sources.map(source => {
          return {
            index: Number(source.index),
            min: Number(source.min),
            max: Number(source.max),
            band: Number(source.band),
            nodata: Number(source.nodata),
          };
        }),
      });
      const layer = new WebGLTile({
        source,
      });
      ol.map.addLayer(layer);
      setLayerConfs(layerConfs => {
        return [
          ...layerConfs,
          {
            id,
            layer,
            sources: sourceConfigs,
          },
        ];
      });

      const fitting = () => {
        const originExtent = source.getBoundingBox();
        const code = source.getProjection().getCode();
        if (ol.map && originExtent && code) {
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
          ol.map.getView().fit(extent, {
            padding: [40, 20, 40, 20],
            maxZoom: 20,
          });
        }
      };

      if (source.getState() === SourceState.READY) {
        fitting();
        reset();
        setFilelist([]);
        setLoading(false);
      } else {
        const sourceListener = () => {
          const sourceState = source.getState();
          if (sourceState !== SourceState.LOADING) {
            source.removeEventListener("change", sourceListener);

            if (sourceState === SourceState.READY) {
              fitting();
              reset();
              setFilelist([]);
            }
            if (sourceState === SourceState.ERROR) {
              setError("SourceError");
            }
            setLoading(false);
          }
        };
        source.addEventListener("change", sourceListener);
      }
      // const source = new CustomGeoTIFFSource.default({
      //   sources: sources.map(source => {
      //     return {
      //       blob: filelist[Number(source.index)],
      //       min: Number(source.min),
      //       max: Number(source.max),
      //       nodata: Number(source.nodata),
      //       bands: [Number(source.band)],
      //     };
      //   }) as unknown as CustomGeoTIFFSource.SourceInfo[],
      // });

      // (async () => {
      // if (!ol.map) return;
      // const sourceView = await source.getView();
      // const sourceProjection = sourceView?.projection;
      // if (!(sourceProjection instanceof Projection)) {
      //   return;
      // }
      // const code = sourceProjection.getCode();

      // if (!getProjection(code)) {
      //   try {
      //     const crs = utils.getCrs(code);
      //     proj4.defs(code, crs);
      //   } catch {
      //     return;
      //   }
      //   olRegister(proj4);
      // }
      // const tileGrid = source.getTileGrid();
      // if (tileGrid) {
      //   const imageSource = new XYZ({
      //     tileGrid: tileGrid,
      //     url: "{z},{x},{y}",
      //     interpolate: false,
      //     tileLoadFunction: function (imageTile: Tile, coordString: string) {
      //       const coord = coordString.split(",").map(Number);
      //       const tile = source.getTile(
      //         coord[0],
      //         coord[1],
      //         coord[2],
      //         1,
      //         sourceProjection
      //       );

      //       const setImage = function () {
      //         const tilesize = toSize(tileGrid.getTileSize(coord[0]));
      //         const canvas = document.createElement("canvas");
      //         canvas.width = tilesize[0];
      //         canvas.height = tilesize[1];
      //         const context = canvas.getContext("2d");
      //         if (!context) return;
      //         const imgData = context.getImageData(
      //           0,
      //           0,
      //           canvas.width,
      //           canvas.height
      //         );

      //         const pixels = imgData.data;
      //         const data = tile.getData();
      //         if (data instanceof DataView) return;
      //         const l = data.length;
      //         for (let i = 0; i < l; i++) {
      //           pixels[i] = data[i];
      //         }
      //         context.putImageData(imgData, 0, 0);
      //         ((imageTile as ImageTile).getImage() as HTMLImageElement).src =
      //           canvas.toDataURL();
      //       };

      //       const tileState = tile.getState();
      //       if (tileState === TileState.LOADED) {
      //         setImage();
      //       } else {
      //         const tileListener = () => {
      //           const tileState = tile.getState();
      //           if (tileState !== TileState.LOADING) {
      //             tile.removeEventListener("change", tileListener);

      //             if (tileState === TileState.LOADED) {
      //               setImage();
      //             }
      //           }
      //         };
      //         tile.addEventListener("change", tileListener);
      //         tile.load();
      //       }
      //     },
      //     projection: sourceProjection,
      //   });

      //   const layer = new WebGLTile({
      //     source: imageSource,
      //   });
      //   ol.map.addLayer(layer);
      //   setLayerConfs(layerConfs => {
      //     return [
      //       ...layerConfs,
      //       {
      //         id,
      //         layer,
      //         error: null,
      //       },
      //     ];
      //   });

      //   const originExtent = sourceView.extent;
      //   if (originExtent) {
      //     let extent = originExtent;
      //     if (code !== "EPSG:3857") {
      //       const transformed = transformExtent(
      //         originExtent,
      //         code,
      //         "EPSG:3857"
      //       );

      //       if (transformed[0] > transformed[2])
      //         transformed[2] += proj4(code, "EPSG:3857", [180, 0])[0] * 2;

      //       extent = transformed;
      //     }
      //     ol.map.getView().fit(extent, {
      //       padding: [40, 20, 40, 20],
      //       maxZoom: 20,
      //     });
      //   }
      // }
      // })();
    },
    [filelist, ol.map, layerConfs, reset]
  );

  const resetList = layerList.reset;
  React.useEffect(() => {
    let zIndex = 0;
    layerConfs.forEach(({ layer }) => {
      layer.setZIndex(zIndex++);
    });

    resetList([...layerConfs]);
  }, [layerConfs, resetList]);
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

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>Display Local GeoTIFF</title>
        <meta name="description" content="Display Remote GeoTIFF on map." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/localgeotiff"
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
        <meta name="twitter:title" content="Display Local GeoTIFF" />
        <meta
          name="twitter:description"
          content="ローカルのGeoTIFFを表示します"
        />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/localgeotiff"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_localgeotiff.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Display Local GeoTIFF
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
                              <Tooltip
                                title={
                                  <div>
                                    {item.value.sources.map((source, i) => {
                                      return (
                                        <Typography
                                          key={i}
                                          variant="caption"
                                          display="block"
                                          {...item.propagation}
                                        >
                                          {source.file}
                                          <LayerDetail>
                                            band: {source.band}
                                            <br />
                                            range:{" "}
                                            {`${source.min} to ${source.max}`}
                                            <br />
                                            nodata: {source.nodata}
                                          </LayerDetail>
                                        </Typography>
                                      );
                                    })}
                                  </div>
                                }
                                arrow
                                placement="left"
                              >
                                <EllipsisTypography variant="body2">
                                  {Array.from(
                                    new Set(
                                      item.value.sources.map(source => {
                                        return source.file;
                                      })
                                    )
                                  ).reduce((prev, name) => {
                                    return (
                                      prev + (prev.length > 0 ? "," : "") + name
                                    );
                                  }, "")}
                                </EllipsisTypography>
                              </Tooltip>
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
        </Stack>

        <Stack my={4} spacing={4}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FileInputWrapper>
              <dt>Read File</dt>
              <dd>
                <input
                  name="file"
                  type="file"
                  accept=".tiff,image/tiff"
                  onChange={e => {
                    if (e.target.files) {
                      const file = e.target.files[0] || undefined;
                      if (file) {
                        setFilelist(prev => {
                          return [...prev, file];
                        });
                        e.target.value = "";
                      }
                    }
                  }}
                  disabled={filelist.length > 2 || loading || loading}
                />
              </dd>
            </FileInputWrapper>
            {fields.map((field, index) => {
              return (
                <Config key={field.id}>
                  <Controller
                    control={control}
                    name={`sources.${index}.index`}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormControl error={invalid} fullWidth size="small">
                        <InputLabel>File</InputLabel>
                        <Select
                          {...field}
                          disabled={filelist.length < 1 || loading}
                        >
                          {filelist.map((f, i) => {
                            return (
                              <MenuItem value={String(i)} key={i}>
                                {f.name}
                              </MenuItem>
                            );
                          })}
                        </Select>

                        {error?.type === "required" && (
                          <FormHelperText>
                            Required. <br />
                            必須です。選択してください。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                    }}
                  />
                  <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 1 }}>
                    <Controller
                      control={control}
                      name={`sources.${index}.band`}
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormControl
                          component="fieldset"
                          error={invalid}
                          fullWidth
                        >
                          <TextField
                            {...field}
                            label="band"
                            size="small"
                            error={invalid}
                            disabled={loading}
                            placeholder="1"
                          />
                          {error?.type === "required" && (
                            <FormHelperText>
                              Required. <br />
                              必須です。入力してください。
                            </FormHelperText>
                          )}
                          {error?.type === "pattern" && (
                            <FormHelperText>
                              must be a number. <br />
                              数値を入力してください。
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
                      name={`sources.${index}.nodata`}
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormControl
                          component="fieldset"
                          error={invalid}
                          disabled={loading}
                          fullWidth
                        >
                          <TextField
                            {...field}
                            label="nodata"
                            size="small"
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
                              must be a number. <br />
                              数値を入力してください。
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
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormControl
                          component="fieldset"
                          error={invalid}
                          disabled={loading}
                          fullWidth
                        >
                          <TextField
                            {...field}
                            label="min"
                            size="small"
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
                              must be a number. <br />
                              数値を入力してください。
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
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormControl
                          component="fieldset"
                          error={invalid}
                          disabled={loading}
                          fullWidth
                        >
                          <TextField
                            {...field}
                            label="max"
                            size="small"
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
                              must be a number. <br />
                              数値を入力してください。
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
                        disabled={loading}
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
                        disabled={loading}
                        onClick={() => {
                          append(defaultSourcesValue);
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </div>
                </Config>
              );
            })}
            <FormControl error={!!error} sx={{ mt: 3 }}>
              <Buttons>
                <li>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={filelist.length < 1 || loading}
                    onClick={() => {
                      setError(null);
                    }}
                  >
                    Add Layer
                  </Button>
                </li>
                <li>
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={() => {
                      setFilelist([]);
                      reset();
                    }}
                    disabled={filelist.length < 1 || loading}
                  >
                    Clear
                  </Button>
                </li>
              </Buttons>
              {error === "SourceNumber" && (
                <FormHelperText sx={{ ml: 0 }}>
                  Unexpected number of sources. <br />
                  ソースの数が正しくありません。
                </FormHelperText>
              )}
              {error === "SourceError" && (
                <FormHelperText sx={{ ml: 0 }}>
                  Catched source error. <br />
                  ソースの設定が正しくありません。
                </FormHelperText>
              )}
              {error === "Duplicate" && (
                <FormHelperText sx={{ ml: 0 }}>
                  Duplicate Layer. <br />
                  すでに同じレイヤーが存在します。
                </FormHelperText>
              )}
            </FormControl>
          </form>
        </Stack>
      </Container>
    </>
  );
};
export default Viewer;
