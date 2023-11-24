import CategoryIcon from "@mui/icons-material/Category";
import ColorizeIcon from "@mui/icons-material/Colorize";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import GridOnIcon from "@mui/icons-material/GridOn";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import LayersIcon from "@mui/icons-material/Layers";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import { Container, Paper, Typography, Stack, Link } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/system";
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";

const StyledPaper = styled(Paper)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  width: "100px",
  height: "100px",
  "&:hover": {
    opacity: 0.7,
  },
  "&:active": {
    transform: "scale(0.96)",
  },
  "& svg": {
    fontSize: "28px",
  },
  "& span": {
    display: "block",
    fontSize: "10px",
    marginBottom: "-12px",
    marginTop: "10px",
    wordBreak: "break-all",
    lineHeight: "1",
    textAlign: "center",
  },
});

const Index = (): React.ReactElement => {
  return (
    <>
      <CssBaseline />
      <Container>
        <Helmet>
          <title>My Experimental Site</title>
          <meta name="description" content="Enjoy trial and error!" />
          <link rel="canonical" href="https://yonda-yonda.github.io/exmap" />
          <link
            rel="icon"
            type="image/x-icon"
            href="https://github.githubassets.com/favicon.ico"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Helmet>
        <Typography variant="h1" component="h1">
          My Experimental Site
        </Typography>
        <Stack mt={4} spacing={4}>
          <section>
            <Typography variant="h5" component="h2">
              Contents
            </Typography>
            <Stack mt={1} direction="row" spacing={2}>
              <RouterLink
                to="/transform"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <CategoryIcon />
                  <span>Transform</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/simplify"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <ContentCutIcon />
                  <span>Simplify</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/picker"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <ColorizeIcon />
                  <span>Picker</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/order"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <LayersIcon />
                  <span>Order</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/picture"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <InsertPhotoIcon />
                  <span>Image</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/grid"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <GridOnIcon />
                  <span>Grid smaple</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/univar"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <EqualizerIcon />
                  <span>Statics</span>
                </StyledPaper>
              </RouterLink>
              <RouterLink
                to="/satellite"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <StyledPaper
                  variant="outlined"
                  sx={{
                    padding: 1,
                  }}
                >
                  <SatelliteAltIcon />
                  <span>Satellite Position</span>
                </StyledPaper>
              </RouterLink>
            </Stack>
          </section>
          <section>
            <Typography variant="h5" component="h2">
              Dependency
            </Typography>
            <ul>
              <li>
                <Link href="https://github.com/facebook/react" target="_blank">
                  React
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/openlayers/openlayers"
                  target="_blank"
                >
                  Openlayers
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/yonda-yonda/geo4326"
                  target="_blank"
                >
                  geo4326
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/theothergrantdavidson/opencv-ts/"
                  target="_blank"
                >
                  opencv-ts
                </Link>
              </li>
            </ul>
          </section>
        </Stack>
      </Container>
    </>
  );
};

export default Index;
