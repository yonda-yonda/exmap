import * as React from "react";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import { Paper, Typography } from "@mui/material";
import { styled } from "@mui/system";
const StyledPaper = styled(Paper)({
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  "&:hover": {
    opacity: 0.7,
  },
  "&:active": {
    transform: "scale(0.98)",
  },
});

export const About = (): React.ReactElement => {
  return (
    <Container>
      <h1>About</h1>

      <Link to="/" style={{ color: "inherit", textDecoration: "inherit" }}>
        <StyledPaper
          component="div"
          variant="outlined"
          sx={{
            padding: 1,
            width: "100px",
            height: "100px",
          }}
        >
          <Typography>Back</Typography>
        </StyledPaper>
      </Link>
    </Container>
  );
};
