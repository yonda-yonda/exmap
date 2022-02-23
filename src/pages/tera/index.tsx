import * as React from "react";
import { Helmet } from "react-helmet-async";
import loadable from "@loadable/component";

const Index = (): React.ReactElement => {
  const Cesium = loadable(() => import("~/components/Cesium"));

  return (
    <>
      <Helmet>
        <title>Cesium</title>
        <link rel="stylesheet" href="../cesium/Widgets/widgets.css" />
      </Helmet>
      <Cesium />
    </>
  );
};

export default Index;
