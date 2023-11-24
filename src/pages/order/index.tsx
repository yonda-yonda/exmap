import {
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Slider,
  Switch,
  Button,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/system";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import XYZ from "ol/source/XYZ";
import * as React from "react";
import { Helmet } from "react-helmet-async";

import { useDnDSort, DnDSortEvent } from "~/hooks/useDnDSort";
import { useOl } from "~/hooks/useOl";

const StyledUl = styled("ul")({
  listStyle: "none",
  margin: 0,
  padding: 0,
  "& > li": {
    position: "relative",
    marginTop: "10px",
    "&:firstChild": {
      marginTop: 0,
    },
  },
});

interface LayerConf {
  id: string;
  name: string;
  layer: TileLayer<XYZ>;
}

const Panel = (props: {
  config: LayerConf;
  propagation: DnDSortEvent;
  remove: (id: string) => void;
}): React.ReactElement => {
  const { config, propagation } = props;
  const layer = config.layer;
  const properties = layer.getProperties();
  const [opacity, setOpacity] = React.useState(properties.opacity * 100);
  const [visible, setVisible] = React.useState(properties.visible);

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary">
          {config.name}
        </Typography>
        <Slider
          size="small"
          value={opacity}
          aria-label="Small"
          valueLabelDisplay="auto"
          onChange={(_, v) => {
            setOpacity(v as number);
            layer.setOpacity((v as number) / 100);
          }}
          {...propagation}
        />
        <Switch
          checked={visible}
          onChange={(_, v) => {
            setVisible(v);
            layer.setVisible(v);
          }}
          {...propagation}
        />
      </CardContent>
      <CardActions>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            props.remove(config.id);
          }}
          {...propagation}
        >
          REMOVE
        </Button>
      </CardActions>
    </Card>
  );
};

const Order = (): React.ReactElement => {
  const ol = useOl({
    zoom: 7,
    center: fromLonLat([139, 36]),
  });
  const init = React.useRef(true);
  const [layerConfs, setLayerConfs] = React.useState<LayerConf[]>([]);

  React.useEffect(() => {
    if (init.current && ol.map) {
      const list = [
        {
          id: "seamlessphoto",
          name: "写真",
          layer: new TileLayer({
            source: new XYZ({
              url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
              attributions:
                "国土地理院(https://maps.gsi.go.jp/development/ichiran.html)",
            }),
          }),
        },
        {
          id: "relief",
          name: "標高",
          layer: new TileLayer({
            source: new XYZ({
              url: "https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png",
              attributions:
                "国土地理院(https://maps.gsi.go.jp/development/ichiran.html)",
            }),
          }),
        },
        {
          id: "lcmfc2",
          name: "治水地形",
          layer: new TileLayer({
            source: new XYZ({
              url: "https://cyberjapandata.gsi.go.jp/xyz/lcmfc2/{z}/{x}/{y}.png",
              attributions:
                "国土地理院(https://maps.gsi.go.jp/development/ichiran.html)",
            }),
          }),
        },
      ];
      list.forEach(({ layer }) => {
        ol.map?.addLayer(layer);
        layer.setOpacity(0.5);
      });
      setLayerConfs(list);
      init.current = false;
    }
  }, [ol.map]);

  const layerList = useDnDSort<LayerConf>({
    defaultItems: [],
    mode: "topbottom",
    drop: (draged, hovered) => {
      if (draged.index !== hovered.index)
        setLayerConfs((prevList) => {
          if (
            hovered.index < 0 ||
            draged.index < 0 ||
            draged.index > prevList.length - 1 ||
            hovered.index > prevList.length - 1
          ) {
            return prevList;
          }

          const nextList = [...prevList];
          const target = nextList[draged.index];
          nextList.splice(draged.index, 1);
          nextList.splice(hovered.index, 0, target);
          return nextList;
        });
    },
  });

  const resetList = layerList.reset;
  React.useEffect(() => {
    let zIndex = 0;
    layerConfs.forEach(({ layer }) => {
      layer.setZIndex(zIndex++);
    });

    resetList([...layerConfs]);
  }, [layerConfs, resetList]);

  const removeLayer = React.useCallback(
    (id: string) => {
      setLayerConfs((layerConfs) => {
        const newLayerConfs = [...layerConfs];
        const index = newLayerConfs.findIndex((layerConf) => {
          return id === layerConf.id;
        });
        const target = newLayerConfs[index];
        if (ol.map && target) {
          ol.map.removeLayer(target.layer);

          newLayerConfs.splice(index, 1);
          return newLayerConfs;
        }
        return newLayerConfs;
      });
    },
    [ol.map]
  );

  return (
    <>
      <CssBaseline />
      <Helmet>
        <title>Order Change</title>
        <meta name="description" content="Change order of layers." />
        <link
          rel="canonical"
          href="https://yonda-yonda.github.io/exmap/geotiff"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://github.githubassets.com/favicon.ico"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Order Change" />
        <meta name="twitter:description" content="レイヤーの重なり順を操作" />
        <meta
          property="og:url"
          content="https://yonda-yonda.github.io/exmap/order"
        />
        <meta
          name="twitter:image"
          content="https://yonda-yonda.github.io/exmap/image/twitter_order.png"
        />
      </Helmet>
      <Container>
        <Typography variant="h2" component="h1">
          Order Change
        </Typography>
        <Stack my={4} spacing={4}>
          <div>
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <div
                  ref={ol.ref}
                  style={{
                    width: "100%",
                    height: "340px",
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <StyledUl>
                  {layerList.items.map((item) => {
                    return (
                      <li ref={item.ref} {...item.trigger} key={item.key}>
                        <Panel
                          config={item.value}
                          propagation={item.propagation}
                          remove={removeLayer}
                        />
                      </li>
                    );
                  })}
                </StyledUl>
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
    </>
  );
};
export default Order;
