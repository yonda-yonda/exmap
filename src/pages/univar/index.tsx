import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { Stack, Button, FormControl, FormHelperText, Box } from "@mui/material";
import { fromBlob, TypedArrayArrayWithDimensions } from "geotiff";

import cv from "opencv-ts";

type FormError = "FailedLoadSource";
const defaultSourceValue = {
  files: "",
};

type Input = {
  files: FileList | string;
};

const Index = (): React.ReactElement => {
  const [error, setError] = React.useState<FormError | null>(null);
  const [loading, setLoading] = React.useState<boolean>();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Input>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: defaultSourceValue,
  });

  const onSubmit: SubmitHandler<Input> = React.useCallback(data => {
    setLoading(true);
    (async () => {
      try {
        if (data.files[0] instanceof File) {
          const start = new Date();
          const tiff = await fromBlob(data.files[0]);
          const image = await tiff.getImage(0);
          const width = image.getWidth();
          const height = image.getHeight();
          const bundNumber =
            image.getSamplesPerPixel() > 2
              ? Math.min(image.getSamplesPerPixel(), 3)
              : 1;
          const cvType = bundNumber > 1 ? cv.CV_8UC3 : cv.CV_8UC1;
          const [x, y] = [4000, 4000];
          const size = [2000, 2000];
          const values = await image.readRasters({
            window: [
              x,
              y,
              x + size[0] >= width ? width : x + size[0],
              y + size[1] >= height ? height : y + size[1],
            ],
            samples: Array.from({ length: bundNumber }, (_, k) => k),
          });
          let value: number[] = [];
          if (Array.isArray(values)) {
            const vs = values as TypedArrayArrayWithDimensions;
            if (bundNumber > 1) {
              for (let i = 0; i < values[0].length; i++) {
                value.push(vs[0][i]);
                value.push(vs[1][i]);
                value.push(vs[2][i]);
              }
            } else {
              value = Array.from(values[0]);
            }
          } else {
            value = Array.from(values);
          }

          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = size[0];
            canvas.height = size[1];
          }
          cv.imshow("canvas", cv.matFromArray(size[1], size[0], cvType, value));

          const end = new Date();
          console.log("time:" + (end.getTime() - start.getTime()) / 1000);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Univar</title>
      </Helmet>

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
              load
            </Button>
          </div>
          {error === "FailedLoadSource" && (
            <FormHelperText sx={{ ml: 0 }}>
              Failed to load source. <br />
              ファイルの読み込みに失敗しました。
            </FormHelperText>
          )}
        </FormControl>
      </form>
      <Box sx={{ pt: 1 }}>
        <canvas ref={canvasRef} id="canvas"></canvas>
      </Box>
    </>
  );
};

export default Index;
