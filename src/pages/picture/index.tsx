import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import CssBaseline from "@mui/material/CssBaseline";
import { join } from "path-browserify";
import {
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  RadioGroup,
  Radio,
  Tooltip,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/system";

import { Map } from "ol";
import SourceState from "ol/source/State";
import TileLayer from "ol/layer/Tile";
import { transformExtent } from "ol/proj";
import MousePosition from "ol/control/MousePosition";
import proj4 from "proj4";
import { useOl } from "~/hooks/useOl";
import { useDnDSort } from "~/hooks/useDnDSort";

import { ImageGrid } from "~/scripts/ImageGrid";

const Hint = styled("div")({
  fontSize: "12px",
});

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
  code: string;
  type: string;
  url: string;
  files: FileList | string;
  extent: string;
};

type SubmitProps = {
  id: string;
  source: Input;
};

type FormError =
  | "Duplicate"
  | "InvalidExtent"
  | "ReversedExtent"
  | "UnsupportedExtent"
  | "FailedLoadSource";

type LayerConf = {
  layer: TileLayer<ImageGrid>;
  name: string;
  id: string;
};

const defaultSourceValue = {
  code: "EPSG:4326",
  type: "file",
  files: "",
  url: "",
  extent: "",
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

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: defaultSourceValue,
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

  const resetList = layerList.reset;
  React.useEffect(() => {
    let zIndex = 0;
    layerConfs.forEach(({ layer }) => {
      layer.setZIndex(zIndex++);
    });

    resetList([...layerConfs]);
  }, [layerConfs, resetList]);

  const setLayer = React.useCallback(
    async (map: Map, id: string, source: Input) => {
      setLoading(true);
      let url = "";
      let revoke = false;
      let name = "";
      const code = source.code;
      const extent = source.extent.split(",").map(v => Number(v));
      switch (source.type) {
        case "file": {
          if (!(source.files instanceof FileList)) break;

          const file = source.files[0];
          name = file.name;
          url = URL.createObjectURL(file);
          revoke = true;
          break;
        }
        case "url": {
          url = source.url;
          name = url;
          break;
        }
      }
      let imageSource: ImageGrid | null = null;
      try {
        imageSource = new ImageGrid({
          projection: code,
          url,
          imageExtent: extent,
          crossOrigin: "anonymous",
        });
      } catch {
        setError("UnsupportedExtent");
        if (revoke) URL.revokeObjectURL(url);
        setLoading(false);
      }
      if (imageSource) {
        const source = imageSource;
        const sourceState = source.getState();
        const setting = () => {
          const layer = new TileLayer({
            source,
          });
          map.addLayer(layer);
          setLayerConfs(layerConfs => {
            return [
              ...layerConfs,
              {
                id,
                layer,
                name,
                error: null,
              },
            ];
          });

          const originExtent = extent;
          if (originExtent) {
            const transformed = transformExtent(
              originExtent,
              code,
              "EPSG:3857"
            );

            if (transformed[0] > transformed[2])
              transformed[2] += proj4(code, "EPSG:3857", [180, 0])[0] * 2;

            map.getView().fit(transformed, {
              padding: [40, 20, 40, 20],
              maxZoom: 20,
            });
          }
        };

        if (sourceState === SourceState.READY) {
          setting();
          if (revoke) URL.revokeObjectURL(url);
          setLoading(false);
        } else {
          const sourceListener = () => {
            const sourceState = source.getState();
            if (sourceState === SourceState.ERROR) {
              source.removeEventListener("change", sourceListener);
              setError("FailedLoadSource");
              if (revoke) URL.revokeObjectURL(url);
              setLoading(false);
            }
            if (sourceState === SourceState.READY) {
              source.removeEventListener("change", sourceListener);
              setting();
              if (revoke) URL.revokeObjectURL(url);
              setLoading(false);
            }
          };
          imageSource.addEventListener("change", sourceListener);
        }
      }
    },
    []
  );

  const load = React.useCallback(
    ({ source, id }: SubmitProps) => {
      if (ol.map) setLayer(ol.map, id, source);
    },
    [ol.map, setLayer]
  );

  React.useEffect(() => {
    if (loading === false) {
      reset();
    }
  }, [loading, reset]);

  const onSubmit: SubmitHandler<Input> = React.useCallback(
    data => {
      const extent = data.extent.split(",").map(v => Number(v));

      for (let i = 0; i < extent.length; i++) {
        const n = extent[i];
        if (!(typeof n === "number" && n - n === 0)) {
          setError("InvalidExtent");
          return;
        }
      }
      if (extent[0] > extent[2] || extent[1] > extent[3]) {
        setError("ReversedExtent");
        return;
      }
      let id = "";
      switch (data.type) {
        case "file": {
          if (!(data.files instanceof FileList)) break;

          const file = data.files[0];
          id += file.name;
          break;
        }
        case "url": {
          const url = data.url;
          id += url;
          break;
        }
      }
      id += extent.join(",");
      if (id.length > 0) {
        const index = layerConfs.findIndex(layerConf => {
          return id === layerConf.id;
        });
        if (index >= 0) {
          setError("Duplicate");
          return;
        }
        load({
          id,
          source: data,
        });
      }
    },
    [load, layerConfs]
  );

  const watcher = watch();
  const sample = React.useCallback(() => {
    reset();
    setValue("code", "EPSG:4326");
    setValue("type", "url");
    setValue(
      "url",
      location.origin + join(location.pathname, "../image/rect.png")
    );
    setValue("extent", "0,0,10,10");

    setError(null);
  }, [setValue, setError, reset]);

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
        <title>Display Image</title>
        <meta name="description" content="Display image on map." />
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
        <meta name="twitter:title" content="Display Image" />
        <meta
          name="twitter:description"
          content="PNG JPEG GIF WEBPを表示します"
        />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/picture"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_picture.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Display Image
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
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    {...item.propagation}
                                  >
                                    {item.value.name}
                                  </Typography>
                                }
                                arrow
                                placement="left"
                              >
                                <EllipsisTypography variant="body2">
                                  {item.value.name}
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
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <div>
                  <Button variant="outlined" onClick={sample} size="small">
                    sample
                  </Button>
                </div>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          value="file"
                          control={<Radio size="small" />}
                          label="Local File"
                        />
                        <FormControlLabel
                          value="url"
                          control={<Radio size="small" />}
                          label="URL"
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
                {watcher.type === "file" && (
                  <FormControl
                    component="fieldset"
                    error={!!errors?.files}
                    fullWidth
                  >
                    <input
                      {...register("files", {
                        required: true,
                        validate: {
                          length: f => f instanceof FileList && f.length === 1,
                        },
                      })}
                      disabled={loading}
                      accept=".webp,.png,.jpeg,.jpg,.gif,image/webp,image/png,image/jpeg,image/svg+xml,image/gif"
                      type="file"
                    />
                    {errors?.files?.type === "required" && (
                      <FormHelperText>
                        Required. <br />
                        ファイルを選択してください。
                      </FormHelperText>
                    )}
                    {errors?.files?.type === "length" && (
                      <FormHelperText>
                        Required. <br />
                        ファイルを1つ選択してください。
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
                {watcher.type === "url" && (
                  <Controller
                    control={control}
                    name="url"
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
                            必須です。入力してください。
                          </FormHelperText>
                        )}
                        {error?.type === "pattern" && (
                          <FormHelperText>
                            Not matched URL pattern.
                            <br />
                            URLの形式が正しくありません。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                      pattern: /(^(https?):\/\/[^ "]+$|(^http:\/\/localhost))/,
                    }}
                  />
                )}
                <Hint>support: .webp, .png, .jpeg, .jpg, .gif</Hint>
                <Stack direction="row" spacing={4} sx={{ mt: 2, mb: 1 }}>
                  <Controller
                    control={control}
                    name="code"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormControl
                        component="fieldset"
                        error={invalid}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="Code"
                          size="small"
                          error={invalid}
                        />
                        {error?.type === "required" && (
                          <FormHelperText>
                            Required. <br />
                            必須です。入力してください。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                    }}
                  />
                  <Controller
                    control={control}
                    name="extent"
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormControl
                        component="fieldset"
                        error={invalid}
                        fullWidth
                      >
                        <TextField
                          {...field}
                          label="Extent"
                          size="small"
                          error={invalid}
                          placeholder="left, bottom, right, top"
                        />
                        {error?.type === "required" && (
                          <FormHelperText>
                            Required. <br />
                            必須です。入力してください。
                          </FormHelperText>
                        )}
                        {error?.type === "pattern" && (
                          <FormHelperText>
                            Must be left bottom and right top coordinates
                            separated by commas.
                            <br />
                            カンマ区切りで左下経度,左下緯度,右上経度,右上緯度を入力してください。
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    rules={{
                      required: true,
                      pattern: /^(\+|-|\.|\d|e|E|,|\s)*$/,
                    }}
                  />
                </Stack>
              </Stack>
              <FormControl error={!!error} sx={{ mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    onClick={() => {
                      setError(null);
                    }}
                  >
                    Add Layer
                  </Button>
                </div>
                {error === "Duplicate" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Duplicate Layer. <br />
                    すでに同じレイヤーが存在します。
                  </FormHelperText>
                )}
                {error === "InvalidExtent" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Extent includes Non-numbers. <br />
                    Extentに数字以外の値が入力されています。
                  </FormHelperText>
                )}
                {error === "ReversedExtent" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Some values of Extent are reversed. <br />
                    Extentに大小が逆の値が含まれています。
                  </FormHelperText>
                )}
                {error === "UnsupportedExtent" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Some values of Extent are unsupported. <br />
                    Extentにサポート外の値が含まれています。
                  </FormHelperText>
                )}
                {error === "FailedLoadSource" && (
                  <FormHelperText sx={{ ml: 0 }}>
                    Failed to load source. <br />
                    ファイルの読み込みに失敗しました。
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
