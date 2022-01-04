import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";

import { Transform } from "~/pages/transform";
import { Top } from "~/pages/top";

function App() {
  return (
    <React.StrictMode>
      <CssBaseline />
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Top />} />
          <Route path="/transform" element={<Transform />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
