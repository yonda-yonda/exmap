import React from "react";
import ReactDOM from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";

import "./index.css";

import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        <title>test</title>
      </Helmet>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
