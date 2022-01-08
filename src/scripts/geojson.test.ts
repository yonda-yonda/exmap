import { parsedLinearRing, getPolygon, getEPSGcode } from "./geojson";

it("parsedLinearRing", () => {
  expect(parsedLinearRing("[[0,0],[1,0],[1,1],[0,1],[0,0]]")).toEqual([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ]);
  expect(parsedLinearRing("[[0,0],[1,0],[1,1],[0,1]]")).toEqual([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ]);
  expect(parsedLinearRing("[[0,0],[0,1],[1,1],[1,0],[0,0]]")).toEqual([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ]);
  expect(parsedLinearRing("[[0,0],[1,0],[1,1],[0,1],[0,0],]")).toEqual([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ]);
  expect(parsedLinearRing("[[0,0],[0,1]]")).toEqual(null);
  expect(parsedLinearRing("abc")).toEqual(null);
});

it("getPolygon", () => {
  expect(
    getPolygon({
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [102.0, 2.0],
            [103.0, 2.0],
            [103.0, 3.0],
            [102.0, 3.0],
            [102.0, 2.0],
          ],
        ],
        [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
          [
            [100.2, 0.2],
            [100.2, 0.8],
            [100.8, 0.8],
            [100.8, 0.2],
            [100.2, 0.2],
          ],
        ],
      ],
    })
  ).toEqual({
    type: "Polygon",
    coordinates: [
      [
        [102.0, 2.0],
        [103.0, 2.0],
        [103.0, 3.0],
        [102.0, 3.0],
        [102.0, 2.0],
      ],
    ],
  });
  expect(
    getPolygon({
      type: "Polygon",
      coordinates: [
        [
          [100.0, 0.0],
          [101.0, 0.0],
          [101.0, 1.0],
          [100.0, 1.0],
          [100.0, 0.0],
        ],
        [
          [100.8, 0.8],
          [100.8, 0.2],
          [100.2, 0.2],
          [100.2, 0.8],
          [100.8, 0.8],
        ],
      ],
    })
  ).toEqual({
    type: "Polygon",
    coordinates: [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
      [
        [100.8, 0.8],
        [100.8, 0.2],
        [100.2, 0.2],
        [100.2, 0.8],
        [100.8, 0.8],
      ],
    ],
  });
  expect(
    getPolygon({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
          [
            [100.8, 0.8],
            [100.8, 0.2],
            [100.2, 0.2],
            [100.2, 0.8],
            [100.8, 0.8],
          ],
        ],
      },
    })
  ).toEqual({
    type: "Polygon",
    coordinates: [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
      [
        [100.8, 0.8],
        [100.8, 0.2],
        [100.2, 0.2],
        [100.2, 0.8],
        [100.8, 0.8],
      ],
    ],
  });
  expect(
    getPolygon({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [100.0, 0.0],
              [101.0, 1.0],
            ],
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0],
              ],
              [
                [100.8, 0.8],
                [100.8, 0.2],
                [100.2, 0.2],
                [100.2, 0.8],
                [100.8, 0.8],
              ],
            ],
          },
        },
      ],
    })
  ).toEqual({
    type: "Polygon",
    coordinates: [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
      [
        [100.8, 0.8],
        [100.8, 0.2],
        [100.2, 0.2],
        [100.2, 0.8],
        [100.8, 0.8],
      ],
    ],
  });
  expect(
    getPolygon({
      type: "GeometryCollection",
      geometries: [
        {
          type: "Point",
          coordinates: [100.0, 0.0],
        },
        {
          type: "LineString",
          coordinates: [
            [101.0, 0.0],
            [102.0, 1.0],
          ],
        },
        {
          type: "Polygon",
          coordinates: [
            [
              [100.0, 0.0],
              [101.0, 0.0],
              [101.0, 1.0],
              [100.0, 1.0],
              [100.0, 0.0],
            ],
          ],
        },
      ],
    })
  ).toEqual({
    type: "Polygon",
    coordinates: [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
    ],
  });
  expect(
    getPolygon({
      type: "LineString",
      coordinates: [
        [100.0, 0.0],
        [101.0, 1.0],
      ],
    })
  ).toEqual(null);
});

it("getEPSGcode", () => {
  expect(
    getEPSGcode(
      {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [102.0, 2.0],
              [103.0, 2.0],
              [103.0, 3.0],
              [102.0, 3.0],
              [102.0, 2.0],
            ],
          ],
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(4326);
  expect(
    getEPSGcode(
      {
        type: "MultiPolygon",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        coordinates: [
          [
            [
              [102.0, 2.0],
              [103.0, 2.0],
              [103.0, 3.0],
              [102.0, 3.0],
              [102.0, 2.0],
            ],
          ],
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(3857);
  expect(
    getEPSGcode(
      {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        coordinates: [102.0, 2.0],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(null);
  expect(
    getEPSGcode(
      {
        type: "Feature",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [102.0, 2.0],
              [103.0, 2.0],
              [103.0, 3.0],
              [102.0, 3.0],
              [102.0, 2.0],
            ],
          ],
        },
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(3857);
  expect(
    getEPSGcode(
      {
        type: "Feature",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        properties: {},
        geometry: {
          type: "Polygon",
          crs: {
            type: "name",
            properties: {
              name: "urn:ogc:def:crs:EPSG::32630",
            },
          },
          coordinates: [
            [
              [102.0, 2.0],
              [103.0, 2.0],
              [103.0, 3.0],
              [102.0, 3.0],
              [102.0, 2.0],
            ],
          ],
        },
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(32630);
  expect(
    getEPSGcode(
      {
        type: "Feature",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        properties: {},
        geometry: {
          type: "Point",
          crs: {
            type: "name",
            properties: {
              name: "urn:ogc:def:crs:EPSG::32630",
            },
          },
          coordinates: [102.0, 2.0],
        },
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(null);
  expect(
    getEPSGcode(
      {
        type: "FeatureCollection",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        features: [
          {
            type: "Feature",
            crs: {
              type: "name",
              properties: {
                name: "urn:ogc:def:crs:EPSG::6668",
              },
            },
            properties: {},
            geometry: {
              type: "Point",
              crs: {
                type: "name",
                properties: {
                  name: "urn:ogc:def:crs:EPSG::3411",
                },
              },
              coordinates: [102.0, 2.0],
            },
          },
          {
            type: "Feature",
            crs: {
              type: "name",
              properties: {
                name: "urn:ogc:def:crs:EPSG::6668",
              },
            },
            properties: {},
            geometry: {
              type: "Polygon",
              crs: {
                type: "name",
                properties: {
                  name: "urn:ogc:def:crs:EPSG::32630",
                },
              },
              coordinates: [
                [
                  [102.0, 2.0],
                  [103.0, 2.0],
                  [103.0, 3.0],
                  [102.0, 3.0],
                  [102.0, 2.0],
                ],
              ],
            },
          },
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(32630);
  expect(
    getEPSGcode(
      {
        type: "FeatureCollection",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        features: [
          {
            type: "Feature",
            crs: {
              type: "name",
              properties: {
                name: "urn:ogc:def:crs:EPSG::6668",
              },
            },
            properties: {},
            geometry: {
              type: "Point",
              crs: {
                type: "name",
                properties: {
                  name: "urn:ogc:def:crs:EPSG::3411",
                },
              },
              coordinates: [102.0, 2.0],
            },
          },
          {
            type: "Feature",
            crs: {
              type: "name",
              properties: {
                name: "urn:ogc:def:crs:EPSG::6668",
              },
            },
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [102.0, 2.0],
                  [103.0, 2.0],
                  [103.0, 3.0],
                  [102.0, 3.0],
                  [102.0, 2.0],
                ],
              ],
            },
          },
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(6668);
  expect(
    getEPSGcode(
      {
        type: "GeometryCollection",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:EPSG::3857",
          },
        },
        geometries: [
          {
            type: "Point",
            crs: {
              type: "name",
              properties: {
                name: "urn:ogc:def:crs:EPSG::3411",
              },
            },
            coordinates: [102.0, 2.0],
          },
          {
            type: "Polygon",
            coordinates: [
              [
                [102.0, 2.0],
                [103.0, 2.0],
                [103.0, 3.0],
                [102.0, 3.0],
                [102.0, 2.0],
              ],
            ],
          },
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(3857);
  expect(
    getEPSGcode(
      {
        type: "FeatureCollection",
        crs: {
          type: "name",
          properties: { name: "urn:ogc:def:crs:EPSG::32630" },
        },
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "MultiPolygon",
              coordinates: [
                [
                  [
                    [724375.84732595551759, 5773051.300383034162223],
                    [1012671.653121415525675, 6913699.923312894999981],
                    [-102907.769304492510855, 7289737.930872189812362],
                    [724375.84732595551759, 5773051.300383034162223],
                  ],
                ],
              ],
            },
          },
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(32630);
  expect(
    getEPSGcode(
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "MultiPolygon",
              coordinates: [
                [
                  [
                    [724375.84732595551759, 5773051.300383034162223],
                    [1012671.653121415525675, 6913699.923312894999981],
                    [-102907.769304492510855, 7289737.930872189812362],
                    [724375.84732595551759, 5773051.300383034162223],
                  ],
                ],
              ],
            },
          },
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(4326);
  expect(
    getEPSGcode(
      {
        type: "GeometryCollection",
        crs: {
          type: "name",
          properties: { name: "urn:ogc:def:crs:EPSG::3857" },
        },
        geometries: [
          {
            type: "MultiPolygon",
            coordinates: [
              [
                [
                  [724375.84732595551759, 5773051.300383034162223],
                  [1012671.653121415525675, 6913699.923312894999981],
                  [-102907.769304492510855, 7289737.930872189812362],
                  [724375.84732595551759, 5773051.300383034162223],
                ],
              ],
            ],
          },
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(3857);
  expect(
    getEPSGcode(
      {
        type: "GeometryCollection",
        geometries: [
          {
            type: "MultiPolygon",
            coordinates: [
              [
                [
                  [724375.84732595551759, 5773051.300383034162223],
                  [1012671.653121415525675, 6913699.923312894999981],
                  [-102907.769304492510855, 7289737.930872189812362],
                  [724375.84732595551759, 5773051.300383034162223],
                ],
              ],
            ],
          },
        ],
      },
      ["Polygon", "MultiPolygon"]
    )
  ).toEqual(4326);
});
