import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Notfound from "./pages/404";
import Grid from "./pages/grid";
import Order from "./pages/order";
import Picker from "./pages/picker";
import Picture from "./pages/picture";
import Satellite from "./pages/satellite";
import Simplify from "./pages/simplify";
import Top from "./pages/top";
import Transform from "./pages/transform";
import Univar from "./pages/univar";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Top />,
    },
    {
      path: "/grid/",
      element: <Grid />,
    },
    {
      path: "/order/",
      element: <Order />,
    },
    {
      path: "/picture/",
      element: <Picture />,
    },
    {
      path: "/picker/",
      element: <Picker />,
    },
    {
      path: "/simplify/",
      element: <Simplify />,
    },
    {
      path: "/transform/",
      element: <Transform />,
    },
    {
      path: "/univar/",
      element: <Univar />,
    },
    {
      path: "/satellite/",
      element: <Satellite />,
    },
    {
      path: "*",
      element: <Notfound />,
    },
  ],
  {
    basename: "/exmap",
  }
);

function App(): React.ReactElement {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
