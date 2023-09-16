import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { Stack, Button, FormControl, FormHelperText } from "@mui/material";
import { fromBlob } from "geotiff";

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
      if (data.files[0] instanceof File) {
        const tiff = await fromBlob(data.files[0]);
        const image = await tiff.getImage(0);
        const width = image.getWidth();
        const height = image.getHeight();

        console.log(width, height);
        const start = new Date();
        const [x, y] = [100, 100];
        const size = 1;
        const values = await image.readRasters({
          window: [
            x,
            y,
            x + size >= width ? width : x + size,
            y + size >= height ? height : y + size,
          ],
          samples: [0],
        });
        const end = new Date();
        console.log(values, (end.getTime() - start.getTime()) / 1000);
      }
      setLoading(false);
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
              Add Layer
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
    </>
  );
};

export default Index;
