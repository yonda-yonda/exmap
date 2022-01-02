import * as React from "react";
import {
  Container,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { utils } from "geo4326";
import { useOl } from "~/hooks/useOl";

type Input = {
  code: string;
  coordinates: string;
};

const parsedLinearRing = (data: string): number[][] | undefined => {
  try {
    const json = JSON.parse(data);
    if (Array.isArray(json)) {
      json.forEach((p) => {
        if (!Array.isArray(p)) throw new Error();
        p.forEach((v) => {
          if (typeof v !== "number") throw new Error();
        });
      });

      if (
        json[0][0] !== json[json.length - 1][0] ||
        json[0][1] !== json[json.length - 1][1]
      ) {
        json.push(json[0]);
      }
      if (json.length < 4) throw new Error();

      if (!utils.isCcw(json)) {
        json.reverse();
      }

      return json;
    }
    return;
  } catch {
    return;
  }
};

export const Transform = (): React.ReactElement => {
  const { control, handleSubmit } = useForm<Input>({
    mode: "onSubmit",
    defaultValues: {
      code: "",
      coordinates: "",
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => console.log(data);

  const ol = useOl();
  return (
    <Container>
      <Typography variant="h2" component="h1">
        Transform to EPSG:4326
      </Typography>
      <Stack mt={4} spacing={4}>
        <section>
          <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
            Input
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Controller
                  control={control}
                  name="code"
                  render={({ field, fieldState: { error } }) => (
                    <FormControl error fullWidth sx={{ mb: 2 }}>
                      <TextField
                        {...field}
                        label="Projection Code"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              EPSG:
                            </InputAdornment>
                          ),
                        }}
                      />
                      {error && <FormHelperText>Error</FormHelperText>}
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
                  render={({ field, fieldState: { error } }) => (
                    <FormControl error fullWidth sx={{ mb: 2 }}>
                      <TextField
                        {...field}
                        label="Coordinates"
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="[[0,0],[1,0],[1,1],[0,1],[0,0]]"
                      />
                      {error && <FormHelperText>Error</FormHelperText>}
                    </FormControl>
                  )}
                  rules={{
                    required: true,
                    validate: {
                      parse: (data) => {
                        return !!parsedLinearRing(data);
                      },
                      selfintersection: (data) => {
                        const points = parsedLinearRing(data);
                        console.log(data, points);
                        return points && !utils.selfintersection(points);
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <div
                  ref={ol.ref}
                  style={{
                    width: "100%",
                    height: "480px",
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button variant="contained" type="submit">
                  submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </section>

        <section>
          <Typography variant="h4" component="h2">
            Result
          </Typography>
        </section>
      </Stack>
    </Container>
  );
};
