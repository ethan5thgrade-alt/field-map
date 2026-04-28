/**
 * Custom Mapbox style that matches the Field Map paper-toned aesthetic.
 * This is a programmatic fallback — ideally replaced by a Mapbox Studio style URL.
 *
 * To use a Mapbox Studio style instead, set NEXT_PUBLIC_MAPBOX_STYLE_URL
 * in your .env.local file.
 */
export const FIELD_MAP_STYLE: mapboxgl.StyleSpecification = {
  version: 8,
  name: "Sitelab Paper",
  sources: {
    "mapbox-streets": {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    },
  },
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sprite: "mapbox://sprites/mapbox/streets-v12",
  layers: [
    // Background — aged vellum
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#EDE6D6",
      },
    },
    // Land
    {
      id: "land",
      type: "fill",
      source: "mapbox-streets",
      "source-layer": "landuse",
      paint: {
        "fill-color": [
          "match",
          ["get", "class"],
          "park", "#D5DECA",
          "cemetery", "#D5DECA",
          "glacier", "#E8E4DC",
          "hospital", "#EDE6D6",
          "school", "#EDE6D6",
          "#EDE6D6",
        ],
        "fill-opacity": 0.6,
      },
    },
    // Water
    {
      id: "water",
      type: "fill",
      source: "mapbox-streets",
      "source-layer": "water",
      paint: {
        "fill-color": "#C2CEBD",
        "fill-opacity": 0.7,
      },
    },
    // Water labels
    {
      id: "water-label",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "natural_label",
      filter: ["==", ["get", "class"], "water"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Italic", "Arial Unicode MS Regular"],
        "text-size": 11,
        "text-letter-spacing": 0.1,
      },
      paint: {
        "text-color": "#7A8B76",
        "text-halo-color": "#C2CEBD",
        "text-halo-width": 1,
      },
    },
    // Buildings
    {
      id: "buildings",
      type: "fill",
      source: "mapbox-streets",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-color": "#E4DDD0",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 0.4],
      },
    },
    // Roads — minor
    {
      id: "road-minor",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "road",
      filter: [
        "all",
        ["match", ["get", "class"], ["street", "street_limited", "service", "track"], true, false],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#D9D2C2",
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 16, 4],
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 12, 0.8],
      },
    },
    // Roads — major
    {
      id: "road-major",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "road",
      filter: [
        "match",
        ["get", "class"],
        ["primary", "secondary", "tertiary", "trunk"],
        true,
        false,
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#C9BFA8",
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 16, 8],
      },
    },
    // Roads — highway
    {
      id: "road-highway",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "road",
      filter: ["==", ["get", "class"], "motorway"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#B8A678",
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, 1.5, 16, 12],
      },
    },
    // Admin boundaries
    {
      id: "admin-boundaries",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "admin",
      filter: [">=", ["get", "admin_level"], 2],
      paint: {
        "line-color": "#C4B9A3",
        "line-width": 1,
        "line-dasharray": [3, 2],
        "line-opacity": 0.5,
      },
    },
    // Place labels — cities
    {
      id: "place-city",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "place_label",
      filter: ["==", ["get", "class"], "city"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 12, 18],
        "text-letter-spacing": 0.08,
        "text-max-width": 10,
      },
      paint: {
        "text-color": "#1A1D1A",
        "text-halo-color": "#EDE6D6",
        "text-halo-width": 1.5,
      },
    },
    // Place labels — towns/villages
    {
      id: "place-town",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "place_label",
      filter: [
        "match",
        ["get", "class"],
        ["town", "village"],
        true,
        false,
      ],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 8, 9, 14, 14],
        "text-letter-spacing": 0.05,
      },
      paint: {
        "text-color": "#5C5F58",
        "text-halo-color": "#EDE6D6",
        "text-halo-width": 1.2,
      },
    },
    // Road labels
    {
      id: "road-label",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "road",
      filter: [
        "match",
        ["get", "class"],
        ["primary", "secondary", "tertiary", "trunk", "motorway"],
        true,
        false,
      ],
      minzoom: 12,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": 10,
        "symbol-placement": "line",
        "text-rotation-alignment": "map",
      },
      paint: {
        "text-color": "#8B8B7E",
        "text-halo-color": "#EDE6D6",
        "text-halo-width": 1,
      },
    },
    // POI labels — minimal
    {
      id: "poi-label",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "poi_label",
      minzoom: 15,
      filter: ["<=", ["get", "filterrank"], 1],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": 10,
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#8B8B7E",
        "text-halo-color": "#EDE6D6",
        "text-halo-width": 1,
        "text-opacity": 0.6,
      },
    },
  ],
};
