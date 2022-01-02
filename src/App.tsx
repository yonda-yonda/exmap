import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";

import { Transform } from "~/pages/transform";
import { Top } from "~/pages/top";
import "./App.css";

function App() {
  return (
    <React.StrictMode>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Top />} />
          <Route path="/transform" element={<Transform />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
