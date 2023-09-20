import * as React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import {
  Stack,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Box,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";

import {
  fromBlob,
  TypedArrayWithDimensions,
  TypedArray,
  GeoTIFFImage,
} from "geotiff";

import cv, { Point } from "opencv-ts";

function getDataRange(
  image: GeoTIFFImage
): [number, number, number | null] | null {
  /*
    respect
        https://github.com/openlayers/openlayers/blob/v6.15.0/src/ol/source/GeoTIFF.js
        https://github.com/geotiffjs/geotiff.js/blob/v2.0.5/src/geotiffimage.js#L44
  */
  const format = image.getSampleFormat();
  const bitsPerSample = image.getBitsPerSample();

  switch (format) {
    case 1: // unsigned integer data
      if (bitsPerSample <= 8) {
        return [0, 255, cv.CV_8UC1];
      } else if (bitsPerSample <= 16) {
        return [0, 65535, cv.CV_16UC1];
      } else if (bitsPerSample <= 32) {
        return [0, 4294967295, null];
      }
      break;
    case 2: // twos complement signed integer data
      if (bitsPerSample === 8) {
        return [-128, 127, cv.CV_8SC1];
      } else if (bitsPerSample === 16) {
        return [-32768, 32767, cv.CV_16UC1];
      } else if (bitsPerSample === 32) {
        return [-2147483648, 2147483647, cv.CV_32SC1];
      }
      break;
    case 3: // floating point data
      switch (bitsPerSample) {
        case 16:
        case 32:
          return [-3.4e38, 3.4e38, cv.CV_32FC1];
        case 64:
          return [-Number.MAX_VALUE, Number.MAX_VALUE, cv.CV_64FC1];
        default:
          break;
      }
      break;
    default:
      break;
  }
  return null;
}

function uint(value: number, min: number, max: number): number {
  if (max === 255 && min === 0) return value;
  const gain = 1 / (max - min);
  const bias = -min * gain;
  return Math.ceil(255 * Math.min(Math.max(gain * value + bias, 0), 1));
}

type FileInput = {
  files: FileList | string;
};

type TiffProps = {
  image: GeoTIFFImage;
  width: number;
  height: number;
  bands: number;
  range: [number, number, number | null];
};

type FileSelectProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setValue: (value: TiffProps) => void;
};

type ReadConfigProps = {
  tiffValue: TiffProps;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setValue: (value: ReadResult | null) => void;
};

type DrawProps = {
  tiffValue: TiffProps;
  readResult: ReadResult;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

type ReadInput = {
  xs: string;
  xe: string;
  ys: string;
  ye: string;
  bands: string;
};

type DrawInput = {
  min: string;
  max: string;
  r: string;
  g: string;
  b: string;
};

type StaticValue = {
  mean: number;
  variance: number;
  min: { value: number; position: Point };
  max: { value: number; position: Point };
};

type TiffData = {
  band: number;
  data: TypedArrayWithDimensions | TypedArray | null;
  statics: StaticValue | null;
};

type ReadResult = {
  elapsed: {
    reading: number | null;
    calcurating: number | null;
  };
  size: number[];
  values: TiffData[];
};

const FileSelect = (props: FileSelectProps): React.ReactElement => {
  const { loading, setValue, setLoading } = props;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FileInput>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      files: "",
    },
  });

  const loadHead = React.useCallback(
    async (files: FileList | string) => {
      if (files instanceof FileList && files.length > 0) {
        setLoading(true);
        try {
          const tiff = await fromBlob(files[0]);
          const image = await tiff.getImage(0);
          const width = image.getWidth();
          const height = image.getHeight();
          const bands = image.getSamplesPerPixel();

          const range = getDataRange(image);
          if (!range) throw new Error("invalid tiff.");
          setValue({ image, width, height, bands, range });
        } finally {
          setLoading(false);
        }
      }
    },
    [setValue, setLoading]
  );

  const onSubmit: SubmitHandler<FileInput> = React.useCallback(
    data => {
      loadHead(data.files);
    },
    [loadHead]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <FormControl component="fieldset" error={!!errors?.files} fullWidth>
          <input
            {...register("files", {
              required: true,
              validate: {
                length: f => f instanceof FileList && f.length === 1,
              },
            })}
            disabled={loading}
            accept=".tif, .tiff"
            type="file"
            onChange={event => {
              if (event.target.files) loadHead(event.target.files);
            }}
          />
          {errors?.files?.type === "required" && (
            <FormHelperText>
              Required. <br />
              ファイルを選択してください。
            </FormHelperText>
          )}
          {errors?.files?.type === "length" && (
            <FormHelperText>
              Select only one. <br />
              ファイルを1つ選択してください。
            </FormHelperText>
          )}
        </FormControl>
      </Stack>
    </form>
  );
};

const ReadConfig = (props: ReadConfigProps): React.ReactElement => {
  const { tiffValue, loading, setLoading, setValue } = props;
  const [error, setError] = React.useState("");

  const { control, watch, handleSubmit, reset } = useForm<ReadInput>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      xs: "0",
      xe: "0",
      ys: "0",
      ye: "0",
      bands: "1",
    },
  });

  React.useEffect(() => {
    reset({
      xs: "0",
      xe: String(Math.min(1000, tiffValue.width)),
      ys: "0",
      ye: String(Math.min(1000, tiffValue.height)),
      bands: Array.from({ length: tiffValue.bands }, (v, k) => k + 1).join(),
    });
  }, [reset, tiffValue]);

  const watcher = watch();

  const warnings = React.useMemo(() => {
    const ret: string[] = [];
    const bands = Array.from(
      new Set(
        watcher.bands
          .split(",")
          .map(v => {
            return parseInt(v);
          })
          .filter(v => !isNaN(v))
      )
    );
    const WARNING_PIXEL_SIZE = 4800 * 4800 * 3;
    const xs = parseInt(watcher.xs);
    const xe = parseInt(watcher.xe);
    const ys = parseInt(watcher.ys);
    const ye = parseInt(watcher.ye);
    if (!isNaN(xs) && !isNaN(xe) && !isNaN(ys) && !isNaN(ye)) {
      if (xe - xs > 32767) ret.push("tooLargeWidth");
      if (ye - ys > 32767) ret.push("tooLargeHeight");

      if ((xe - xs) * (ye - ys) * bands.length > WARNING_PIXEL_SIZE)
        ret.push("tooLargePixelReading");
    }

    return ret;
  }, [watcher]);

  const onSubmit: SubmitHandler<ReadInput> = React.useCallback(
    data => {
      setValue(null);
      setError("");

      const x = [parseInt(data.xs), parseInt(data.xe)];
      const y = [parseInt(data.ys), parseInt(data.ye)];

      if (isNaN(x[0])) {
        setError("nanOfXs");
        return;
      }
      if (x[0] < 0 || tiffValue.width < x[0]) {
        setError("outOfRangeXs");
        return;
      }
      if (isNaN(x[1])) {
        setError("nanOfXe");
        return;
      }
      if (x[1] < 0 || tiffValue.width < x[1]) {
        setError("outOfRangeXe");
        return;
      }
      if (x[1] <= x[0]) {
        setError("reverseX");
        return;
      }
      if (isNaN(y[0])) {
        setError("nanOfYs");
        return;
      }
      if (y[0] < 0 || tiffValue.height < y[0]) {
        setError("outOfRangeYs");
        return;
      }
      if (isNaN(y[1])) {
        setError("nanOfYe");
        return;
      }
      if (y[1] < 0 || tiffValue.height < y[1]) {
        setError("outOfRangeYe");
        return;
      }
      if (y[1] <= y[0]) {
        setError("reverseY");
        return;
      }
      const bands = Array.from(
        new Set(
          data.bands
            .split(",")
            .map(v => {
              return parseInt(v);
            })
            .filter(v => !isNaN(v))
        )
      );
      const minBand = Math.min(...bands);
      const maxBand = Math.max(...bands);
      if (
        minBand < 1 ||
        tiffValue.bands < minBand ||
        maxBand < 1 ||
        tiffValue.bands < maxBand
      ) {
        setError("outOfRangeBands");
        return;
      }

      (async () => {
        const size = [x[1] - x[0], y[1] - y[0]];
        let reading: number | null = null;
        let calcurating: number | null = null;
        const calcurated: StaticValue[] = [];
        let values: (TypedArrayWithDimensions | TypedArray)[] = [];

        try {
          setLoading(true);

          const start1 = new Date();
          const rasters = await tiffValue.image.readRasters({
            window: [x[0], y[0], x[1], y[1]],
            samples: bands.map(v => {
              return v - 1;
            }),
          });
          const end1 = new Date();
          reading = (end1.getTime() - start1.getTime()) / 1000;
          values = Array.isArray(rasters) ? rasters : [rasters];

          const calc = (
            valus: TypedArrayWithDimensions | TypedArray,
            size: number[],
            type: number
          ): StaticValue => {
            const mat = cv.matFromArray(
              size[1],
              size[0],
              type,
              Array.from(valus)
            );
            const { minVal, maxVal, minLoc, maxLoc } = cv.minMaxLoc(mat);
            const mean = new cv.Mat();
            const stddev = new cv.Mat();
            cv.meanStdDev(mat, mean, stddev);

            return {
              mean: mean.doubleAt(0, 0),
              variance: stddev.doubleAt(0, 0),
              min: {
                value: minVal,
                position: minLoc,
              },
              max: {
                value: maxVal,
                position: maxLoc,
              },
            };
          };
          const type = tiffValue.range[2];
          if (type !== null) {
            const start2 = new Date();
            values.forEach((v, i) => {
              calcurated.push(calc(v, size, type));
            });
            const end2 = new Date();
            calcurating = (end2.getTime() - start2.getTime()) / 1000;
          }
        } finally {
          setLoading(false);

          const tiffDatas: TiffData[] = [];
          bands.forEach((b, i) => {
            tiffDatas.push({
              band: b,
              data: values.length > i ? values[i] : null,
              statics: calcurated.length > i ? calcurated[i] : null,
            });
          });

          setValue({
            elapsed: {
              reading,
              calcurating,
            },
            size,
            values: tiffDatas,
          });
        }
      })();
    },
    [tiffValue, setValue, setLoading]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="xs"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormControl
                component="fieldset"
                error={invalid}
                fullWidth
                sx={{ mb: 2 }}
              >
                <TextField
                  {...field}
                  label="start x"
                  error={invalid}
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
                    Must be a positive number or zero. <br />
                    0以上の整数を入力してください。
                  </FormHelperText>
                )}
              </FormControl>
            )}
            rules={{
              required: true,
              pattern: /^[0-9]{1,}$/,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="xe"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormControl
                component="fieldset"
                error={invalid}
                fullWidth
                sx={{ mb: 2 }}
              >
                <TextField
                  {...field}
                  label="end x"
                  error={invalid}
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
                    Must be a positive number or zero. <br />
                    0以上の整数を入力してください。
                  </FormHelperText>
                )}
              </FormControl>
            )}
            rules={{
              required: true,
              pattern: /^[0-9]{1,}$/,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="ys"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormControl
                component="fieldset"
                error={invalid}
                fullWidth
                sx={{ mb: 2 }}
              >
                <TextField
                  {...field}
                  label="start y"
                  error={invalid}
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
                    Must be a positive number or zero. <br />
                    0以上の整数を入力してください。
                  </FormHelperText>
                )}
              </FormControl>
            )}
            rules={{
              required: true,
              pattern: /^[0-9]{1,}$/,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="ye"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormControl
                component="fieldset"
                error={invalid}
                fullWidth
                sx={{ mb: 2 }}
              >
                <TextField
                  {...field}
                  label="end y"
                  error={invalid}
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
                    Must be a positive number or zero. <br />
                    0以上の整数を入力してください。
                  </FormHelperText>
                )}
              </FormControl>
            )}
            rules={{
              required: true,
              pattern: /^[0-9]{1,}$/,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="bands"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormControl
                component="fieldset"
                error={invalid}
                fullWidth
                sx={{ mb: 2 }}
              >
                <TextField
                  {...field}
                  label="bands"
                  error={invalid}
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
                    Must be Integer or &quot;,&quot;. <br />
                    正数またはカンマを入力してください。
                  </FormHelperText>
                )}
              </FormControl>
            )}
            rules={{
              required: true,
              pattern: /^[1-9]([0-9]|,)*$/,
            }}
          />
          {warnings.length > 0 && (
            <Box>
              {warnings.includes("tooLargeWidth") && (
                <FormHelperText>
                  HTML canvas dosen&#39;t support too large width.
                  <br />
                  幅が大きすぎるため、canvasで描画できません。
                </FormHelperText>
              )}
              {warnings.includes("tooLargeHeight") && (
                <FormHelperText>
                  HTML canvas dosen&#39;t support too large height.
                  <br />
                  高さが大きすぎるため、canvasで描画できません。
                </FormHelperText>
              )}
              {warnings.includes("tooLargePixelReading") && (
                <FormHelperText>
                  The browser may crash due to the large area to be loaded.{" "}
                  <br />
                  読み込む範囲が広いためブラウザがクラッシュする可能性があります。
                </FormHelperText>
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <FormControl error={!!error} sx={{ mb: 2 }}>
            <Button variant="contained" type="submit" disabled={loading}>
              Load
            </Button>
            {error === "nanOfXs" && (
              <FormHelperText>
                start x is Invalid value. <br />
                start x に正しい値を入力してくだい。
              </FormHelperText>
            )}
            {error === "outOfRangeXs" && (
              <FormHelperText>
                start x is out of range. <br />
                start x に範囲外の数値が設定されています。
              </FormHelperText>
            )}
            {error === "nanOfXe" && (
              <FormHelperText>
                end x is Invalid value. <br />
                end x に正しい値を入力してくだい。
              </FormHelperText>
            )}
            {error === "outOfRangeXe" && (
              <FormHelperText>
                end x is out of range. <br />
                end x に範囲外の数値が設定されています。
              </FormHelperText>
            )}
            {error === "reverseX" && (
              <FormHelperText>
                end x must be greater than start x. <br />
                end x に start x よりも小さい数値が設定されています。
              </FormHelperText>
            )}
            {error === "nanOfYs" && (
              <FormHelperText>
                start y is Invalid value. <br />
                start y に正しい値を入力してくだい。
              </FormHelperText>
            )}
            {error === "outOfRangeYs" && (
              <FormHelperText>
                start y is out of range. <br />
                start y に範囲外の数値が設定されています。
              </FormHelperText>
            )}
            {error === "nanOfYe" && (
              <FormHelperText>
                end x is Invalid value. <br />
                end x に正しい値を入力してくだい。
              </FormHelperText>
            )}
            {error === "outOfRangeYe" && (
              <FormHelperText>
                end y is out of range. <br />
                end y に範囲外の数値が設定されています。
              </FormHelperText>
            )}
            {error === "reverseY" && (
              <FormHelperText>
                end y must be greater than start y. <br />
                end y に start y よりも小さい数値が設定されています。
              </FormHelperText>
            )}
            {error === "outOfRangeBands" && (
              <FormHelperText>
                bands include out of range value. <br />
                bands に存在しないレイヤーが設定されています。
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

const Draw = (props: DrawProps): React.ReactElement => {
  const { tiffValue, readResult, loading, setLoading } = props;

  const drawRef = React.useRef<HTMLElement>(null);
  const [error, setError] = React.useState("");

  const { control, handleSubmit } = useForm<DrawInput>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      min: "",
      max: "",
      r: String(readResult.values.length > 0 ? readResult.values[0].band : 1),
      g: String(readResult.values.length > 1 ? readResult.values[1].band : 1),
      b: String(readResult.values.length > 2 ? readResult.values[2].band : 1),
    },
  });

  const onSubmit: SubmitHandler<DrawInput> = React.useCallback(
    data => {
      setError("");

      const r = parseInt(data.r);
      const g = parseInt(data.g);
      const b = parseInt(data.b);
      const rData = readResult.values.find(v => {
        return v.band === r;
      })?.data;
      const gData = readResult.values.find(v => {
        return v.band === g;
      })?.data;
      const bData = readResult.values.find(v => {
        return v.band === b;
      })?.data;
      if (!rData) {
        setError("invalidR");
        return;
      }
      if (!gData) {
        setError("invalidG");
        return;
      }
      if (!bData) {
        setError("invalidB");
        return;
      }

      const minCanvasValue = parseFloat(data.min);
      const maxCanvasValue = parseFloat(data.max);
      if (
        !isNaN(minCanvasValue) &&
        !isNaN(maxCanvasValue) &&
        maxCanvasValue <= minCanvasValue
      ) {
        setError("reverseCanvasValue");
        return;
      }
      const drawElement = drawRef.current;
      if (!drawElement) return;
      while (drawElement.firstChild) {
        drawElement.removeChild(drawElement.firstChild);
      }
      try {
        setLoading(true);

        const min = !isNaN(minCanvasValue)
          ? minCanvasValue
          : tiffValue.range[0];
        const max = !isNaN(maxCanvasValue)
          ? maxCanvasValue
          : tiffValue.range[1];

        const cvType = cv.CV_8UC3;
        const len = rData.length;
        const value: number[] = [];
        for (let i = 0; i < len; i++) {
          value.push(uint(rData[i], min, max));
          value.push(uint(gData[i], min, max));
          value.push(uint(bData[i], min, max));
        }

        const canvas = document.createElement("canvas");
        canvas.width = readResult.size[0];
        canvas.height = readResult.size[1];

        const imgMat = cv.matFromArray(
          readResult.size[1],
          readResult.size[0],
          cvType,
          value
        );

        cv.imshow(canvas, imgMat);
        drawElement.appendChild(canvas);
      } finally {
        setLoading(false);
      }
    },
    [tiffValue, readResult, setLoading]
  );

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Draw Config
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Controller
              control={control}
              name="r"
              render={({ field, fieldState: { invalid } }) => (
                <FormControl
                  component="fieldset"
                  error={invalid}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <InputLabel id="select-r-label">R</InputLabel>
                  <Select
                    {...field}
                    labelId="select-r-label"
                    label="R"
                    error={invalid}
                    disabled={loading}
                  >
                    {readResult.values.map(v => {
                      return (
                        <MenuItem key={v.band} value={v.band}>
                          {v.band}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              control={control}
              name="g"
              render={({ field, fieldState: { invalid } }) => (
                <FormControl
                  component="fieldset"
                  error={invalid}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <InputLabel id="select-g-label">G</InputLabel>
                  <Select
                    {...field}
                    labelId="select-g-label"
                    label="G"
                    error={invalid}
                    disabled={loading}
                  >
                    {readResult.values.map(v => {
                      return (
                        <MenuItem key={v.band} value={v.band}>
                          {v.band}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              control={control}
              name="b"
              render={({ field, fieldState: { invalid } }) => (
                <FormControl
                  component="fieldset"
                  error={invalid}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <InputLabel id="select-b-label">B</InputLabel>
                  <Select
                    {...field}
                    labelId="select-b-label"
                    label="B"
                    error={invalid}
                    disabled={loading}
                  >
                    {readResult.values.map(v => {
                      return (
                        <MenuItem key={v.band} value={v.band}>
                          {v.band}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              control={control}
              name="min"
              render={({ field, fieldState: { invalid, error } }) => (
                <FormControl
                  component="fieldset"
                  error={invalid}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <TextField
                    {...field}
                    label="min (optional)"
                    error={invalid}
                    disabled={loading}
                  />
                  {error?.type === "pattern" && (
                    <FormHelperText>
                      Must be number. <br />
                      数値を入力してください。
                    </FormHelperText>
                  )}
                </FormControl>
              )}
              rules={{
                pattern: /^-?[0-9]+(\.[0-9]+)*$/,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="max"
              render={({ field, fieldState: { invalid, error } }) => (
                <FormControl
                  component="fieldset"
                  error={invalid}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <TextField
                    {...field}
                    label="max (optional)"
                    error={invalid}
                    disabled={loading}
                  />
                  {error?.type === "pattern" && (
                    <FormHelperText>
                      Must be number. <br />
                      数値を入力してください。
                    </FormHelperText>
                  )}
                </FormControl>
              )}
              rules={{
                pattern: /^-?[0-9]+(\.[0-9]+)*$/,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl error={!!error} sx={{ mb: 2 }}>
              <Button variant="contained" type="submit" disabled={loading}>
                Draw
              </Button>
              {error === "inavlidR" && (
                <FormHelperText>
                  r is invalid. <br />
                  rの値が不正です。
                </FormHelperText>
              )}
              {error === "inavlidG" && (
                <FormHelperText>
                  g is invalid. <br />
                  gの値が不正です。
                </FormHelperText>
              )}
              {error === "inavlidB" && (
                <FormHelperText>
                  b is invalid. <br />
                  bの値が不正です。
                </FormHelperText>
              )}
              {error === "reverseCanvasValue" && (
                <FormHelperText>
                  max must be greater than min. <br />
                  max に min よりも小さい数値が設定されています。
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </form>

      <Box ref={drawRef} sx={{ py: 2 }}></Box>
    </Stack>
  );
};

const Index = (): React.ReactElement => {
  const [loading, setLoading] = React.useState(false);
  const [tiffValue, setTiffValue] = React.useState<TiffProps>();
  const [readResult, setReadResult] = React.useState<ReadResult | null>(null);

  return (
    <>
      <Helmet>
        <title>Univariate</title>
        <meta name="description" content="Univariate of GeoTIFF." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/univar"
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
        <meta name="twitter:title" content="Univariate of GeoTIFF" />
        <meta
          name="twitter:description"
          content="GeoTIFFの統計量を計算します。"
        />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/univar"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_univar.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Univariate
        </Typography>
        <Stack my={4} spacing={8}>
          <Stack spacing={2}>
            <Box>
              <FileSelect
                loading={loading}
                setLoading={loading => {
                  setLoading(loading);
                }}
                setValue={value => {
                  setReadResult(null);
                  setTiffValue(value);
                }}
              />
            </Box>
            {tiffValue &&
              (!readResult ? (
                <Stack spacing={2}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Width
                        </TableCell>
                        <TableCell>{tiffValue.width}px</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Height
                        </TableCell>
                        <TableCell>{tiffValue.height}px</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Number of bands
                        </TableCell>
                        <TableCell>{tiffValue.bands}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Box sx={{ pt: 2 }}>
                    <ReadConfig
                      tiffValue={tiffValue}
                      loading={loading}
                      setLoading={setLoading}
                      setValue={setReadResult}
                    />
                  </Box>
                </Stack>
              ) : (
                <Box sx={{ pt: 4 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Reading
                        </TableCell>
                        <TableCell>
                          {readResult.elapsed.reading
                            ? readResult.elapsed.reading + "s"
                            : "failed."}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Calcurating
                        </TableCell>
                        <TableCell>
                          {readResult.elapsed.calcurating
                            ? readResult.elapsed.calcurating + "s"
                            : "failed."}
                        </TableCell>
                      </TableRow>

                      {readResult.values.map((v, i) => {
                        return (
                          <TableRow key={i}>
                            <TableCell component="th" scope="row">
                              Band {v.band}
                            </TableCell>
                            <TableCell>
                              {v.statics ? (
                                <Box>
                                  min {v.statics.min.value} at (
                                  {v.statics.min.position.x},{" "}
                                  {v.statics.min.position.y})
                                  <br />
                                  max {v.statics.max.value} at (
                                  {v.statics.max.position.x},{" "}
                                  {v.statics.max.position.y})
                                  <br />
                                  mean {v.statics.mean}
                                  <br />
                                  variance {v.statics.variance}
                                </Box>
                              ) : (
                                "failed."
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <Box sx={{ mt: 4 }}>
                    <Draw
                      tiffValue={tiffValue}
                      readResult={readResult}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </Box>
                </Box>
              ))}
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Index;
