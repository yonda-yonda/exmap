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
  Tooltip,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/system";

import SourceState from "ol/source/State";
import { WebGLTile } from "ol/layer";

import { useOl } from "~/hooks/useOl";
import { useDnDSort } from "~/hooks/useDnDSort";
import { GeoTIFFGrid, colormaps, RendererMode } from "~/scripts/GeotiffGrid";

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
  mode: string;
  maxPixel: number;
  cmap?: string;
}

const defaultSourcesValue = {
  index: "0",
  band: "1",
  nodata: "0",
  min: "0",
  max: "255",
};

interface Input {
  mode: string;
  maxPixel: string;
  cmap: string;
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

const Config = styled("dl")({
  display: "flex",
  "&>dt": {
    fontSize: "12px",
    flex: "0 0 auto",
    marginRight: "20px",
  },
  "&>dd": {
    marginLeft: "0px",
  },
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

  const { control, handleSubmit, reset, watch } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      mode: "rgb",
      cmap: "",
      maxPixel: "9000000",
      sources: [
        { ...defaultSourcesValue, band: "1" },
        { ...defaultSourcesValue, band: "2" },
        { ...defaultSourcesValue, band: "3" },
      ],
    },
  });

  const { fields } = useFieldArray({
    name: "sources",
    control,
  });

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    data => {
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
      if (data.cmap.length > 0) id += "_" + data.cmap;
      const index = layerConfs.findIndex(layerConf => {
        return id === layerConf.id;
      });
      if (index >= 0) {
        setError("Duplicate");
        return;
      }
      if (!ol.map) return;

      setLoading(true);
      const source = new GeoTIFFGrid({
        files: filelist,
        mode: data.mode as RendererMode,
        maxPixel: Number(data.maxPixel),
        cmap: data.cmap || undefined,
        sources: data.sources.map(source => {
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

      const fitting = () => {
        if (ol.map) {
          const extent = source.getBoundingBox("EPSG:3857");
          if (extent)
            ol.map.getView().fit(extent, {
              padding: [40, 20, 40, 20],
              maxZoom: 20,
            });
        }
      };
      const setting = () => {
        const sourceState = source.getState();
        if (sourceState === SourceState.READY) {
          fitting();
          reset();
          setFilelist([]);
          setLayerConfs(layerConfs => {
            return [
              ...layerConfs,
              {
                id,
                layer,
                sources: sourceConfigs,
                mode: data.mode as RendererMode,
                maxPixel: Number(data.maxPixel),
                cmap: data.cmap || undefined,
              },
            ];
          });
          setLoading(false);
        }
        if (sourceState === SourceState.ERROR) {
          setError("SourceError");
          if (ol.map) ol.map.removeLayer(layer);
        }
      };

      if (source.getState() === SourceState.READY) {
        setting();
      } else {
        const sourceListener = () => {
          const sourceState = source.getState();
          if (sourceState !== SourceState.LOADING) {
            source.removeEventListener("change", sourceListener);
            setting();
          }
        };
        source.addEventListener("change", sourceListener);
      }
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
                                  <div {...item.propagation}>
                                    {item.value.sources.map((source, i) => {
                                      return (
                                        <Typography
                                          key={i}
                                          variant="caption"
                                          display="block"
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
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      Mode: {item.value.mode}
                                    </Typography>
                                    {item.value.cmap && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        Color Map: {item.value.cmap}
                                      </Typography>
                                    )}
                                    <Typography
                                      variant="caption"
                                      display="block"
                                    >
                                      Max Pixel: {item.value.maxPixel}px
                                    </Typography>
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
                      reset({
                        mode: "rgb",
                        cmap: "",
                        maxPixel: "9000000",
                        sources: [
                          {
                            ...defaultSourcesValue,
                            band: "1",
                          },
                          {
                            ...defaultSourcesValue,
                            band: "2",
                          },
                          {
                            ...defaultSourcesValue,
                            band: "3",
                          },
                        ],
                      });
                    }
                  }
                }}
                disabled={filelist.length > 2 || loading || loading}
              />
            </dd>
          </FileInputWrapper>
          {filelist.length > 0 && (
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="mode"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormControl error={invalid} fullWidth size="small">
                      <InputLabel>Renderer Mode</InputLabel>
                      <Select
                        {...field}
                        onChange={v => {
                          const mode = v.target.value;

                          switch (mode) {
                            case "rgb": {
                              reset({
                                mode: "rgb",
                                cmap: "",
                                maxPixel: "9000000",
                                sources: [
                                  { ...defaultSourcesValue, band: "1" },
                                  { ...defaultSourcesValue, band: "2" },
                                  { ...defaultSourcesValue, band: "3" },
                                ],
                              });
                              break;
                            }
                            case "single": {
                              reset({
                                mode: "single",
                                cmap: colormaps[0],
                                maxPixel: "9000000",
                                sources: [
                                  { ...defaultSourcesValue, band: "1" },
                                ],
                              });
                              break;
                            }
                            case "ndi": {
                              reset({
                                mode: "ndi",
                                cmap: colormaps[0],
                                maxPixel: "9000000",
                                sources: [
                                  { ...defaultSourcesValue, band: "1" },
                                  { ...defaultSourcesValue, band: "2" },
                                ],
                              });
                              break;
                            }
                          }
                        }}
                      >
                        {["rgb", "single", "ndi"].map((v, i) => {
                          return (
                            <MenuItem value={v} key={i}>
                              {v}
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
              </Grid>
              <Grid item xs={12}>
                {fields.map((field, index) => {
                  return (
                    <Config key={field.id}>
                      <dt>Index {index}</dt>
                      <dd>
                        <Controller
                          control={control}
                          name={`sources.${index}.index`}
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
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
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ mt: 2, mb: 1 }}
                        >
                          <Controller
                            control={control}
                            name={`sources.${index}.band`}
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
                            render={({
                              field,
                              fieldState: { invalid, error },
                            }) => (
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
                            render={({
                              field,
                              fieldState: { invalid, error },
                            }) => (
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
                            render={({
                              field,
                              fieldState: { invalid, error },
                            }) => (
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
                      </dd>
                    </Config>
                  );
                })}
              </Grid>
              {watch().mode !== "rgb" && (
                <Grid item xs={6}>
                  <Controller
                    control={control}
                    name="cmap"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormControl error={invalid} fullWidth size="small">
                        <InputLabel>Color Map</InputLabel>
                        <Select {...field}>
                          {colormaps.map((v, i) => {
                            return (
                              <MenuItem value={v} key={i}>
                                {v}
                              </MenuItem>
                            );
                          })}
                        </Select>

                        {(error?.type === "required" ||
                          error?.type === "minLength") && (
                          <FormHelperText>
                            Required. <br />
                            必須です。選択してください。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                      minLength: 1,
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={6}>
                <Controller
                  control={control}
                  name="maxPixel"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormControl
                      component="fieldset"
                      error={invalid}
                      disabled={loading}
                      fullWidth
                    >
                      <TextField
                        {...field}
                        label="Max Pixel Size"
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
                          正の整数を入力してください。
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                  rules={{
                    required: true,
                    pattern: /^([1-9][0-9]*|0)$/,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl error={!!error}>
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
              </Grid>
            </Grid>
          )}
        </form>
      </Container>
    </>
  );
};
export default Viewer;
