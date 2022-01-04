import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Paper, Typography, Stack, Link } from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import { styled } from "@mui/system";
const StyledPaper = styled(Paper)({
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  "flex-direction": "column",
  width: "100px",
  height: "100px",
  "&:hover": {
    opacity: 0.7,
  },
  "&:active": {
    transform: "scale(0.96)",
  },
  "& svg": {
    "font-size": "28px",
  },
  "& span": {
    display: "block",
    "font-size": "10px",
    "margin-bottom": "-12px",
    "margin-top": "10px",
    "word-break": "break-all",
    "line-height": "1",
    "text-align": "center",
  },
});

export const Top = (): React.ReactElement => {
  return (
    <Container>
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
          </ul>
        </section>
      </Stack>
    </Container>
  );
};
