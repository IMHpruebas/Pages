mapboxgl.accessToken =
  "pk.eyJ1IjoiaWFyYWtpc3RhaW4iLCJhIjoiY2t4NHBqNHd1MHRvaTJubnhodmxqdXhjbiJ9.T6OE8lXKHGCObadLCmIoqg";

const map = new mapboxgl.Map({
  container: "map", // container id
  //style: 'mapbox://styles/mapbox/light-v10',
  style: "mapbox://styles/mapbox/streets-v11",

  //style: 'mapbox://styles/iarakistain/cjiufwthk5o2q2rmnydlxi0l0',
  center: [-2.50305, 43.18774], // starting position
  zoom: 16, // starting zoom
  bearing: 35,
  pitch: 78,
  antialias: true,
});

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserHeading: true,
  }),
  "top-left"
);
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), "top-left");

/* Adding custom control / custom button for toggling the sidebar*/
class MapboxGLButtonControl {
  constructor({ className = "", title = "", eventHandler = evtHndlr }) {
    this._className = className;
    this._title = title;
    this._eventHandler = eventHandler;
  }

  onAdd(map) {
    this._btn = document.createElement("button");
    this._btn.className = "mapboxgl-ctrl-icon" + " " + this._className;
    this._btn.type = "button";
    this._btn.title = this._title;
    this._btn.onclick = this._eventHandler;

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

/* Event Handlers */
function one(event) {
  console.log("button used");
}

/* Instantiate new controls with custom event handlers */
const ctrlPoint = new MapboxGLButtonControl({
  className: "toggle-left-sidebar-display",
  title: "Toolge left sidebar display",
  eventHandler: one,
});

map.addControl(ctrlPoint, "top-left");

/* end adding custom control / custom button for toggling the left sidebar*/

const directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: "metric",
  language: "es",
  steps: true,
  profile: "mapbox/walking",
  alternatives: "true",
  geometries: "geojson",
});

map.scrollZoom.enable();
map.addControl(directions, "top-right");

const clearances = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-2.50187, 43.187107],
      },
      properties: {
        clearance: "0.1' 0.1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-2.506984, 43.18789],
      },
      properties: {
        clearance: "13' 7",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-2.506866, 43.18839],
      },
      properties: {
        clearance: "13' 7",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-84.60485, 38.12184],
      },
      properties: {
        clearance: "13' 7",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-84.61905, 37.87504],
      },
      properties: {
        clearance: "12' 0",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-84.55946, 38.30213],
      },
      properties: {
        clearance: "13' 6",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-84.27235, 38.04954],
      },
      properties: {
        clearance: "13' 6",
      },
    },
    {
      type: "Feature",

      geometry: {
        type: "Point",

        coordinates: [2.506866, 43.18839],
      },
      properties: {
        description:
          "<strong>Truckeroo</strong><p>Truckeroo brings dozens of food trucks, live music, and games to half and M Street SE (across from Navy Yard Metro Station) today from 11:00 a.m. to 11:00 p.m.</p>",
      },
    },
  ],
};

const obstacle = turf.buffer(clearances, 0.02, { units: "kilometers" });

map.on("load", () => {
  map.addLayer({
    id: "clearances",
    type: "fill",
    source: {
      type: "geojson",
      data: obstacle,
    },
    layout: {},
    paint: {
      "fill-color": "#f03b20",
      "fill-opacity": 0.5,
      "fill-outline-color": "#f03b20",
    },
  });

  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  map.on("mouseenter", "places", (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = "pointer";

    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on("mouseleave", "places", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  // Create a default Marker and add it to the map.
  const marker1 = new mapboxgl.Marker()
    .setLngLat([-2.506984, 43.18789])
    .addTo(map);

  // Create a default Marker and add it to the map.
  const marker2 = new mapboxgl.Marker({ color: "red", rotation: 15 })
    .setLngLat([-2.50187, 43.187107])
    .addTo(map);

  // Create a default Marker and add it to the map.
  const marker3 = new mapboxgl.Marker()
    .setLngLat([-2.506866, 43.18839])
    .addTo(map);

  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;
  const labelLayerId = layers.find(
    (layer) => layer.type === "symbol" && layer.layout["text-field"]
  ).id;

  // The 'building' layer in the Mapbox Streets
  // vector tileset contains building height data
  // from OpenStreetMap.
  map.addLayer(
    {
      id: "add-3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",

        // Use an 'interpolate' expression to
        // add a smooth transition effect to
        // the buildings as the user zooms in.
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.6,
      },
    },
    labelLayerId
  );

  // Create sources and layers for the returned routes.
  // There will be a maximum of 3 results from the Directions API.
  // We use a loop to create the sources and layers.
  for (let i = 0; i < 3; i++) {
    map.addSource(`route${i}`, {
      type: "geojson",
      data: {
        type: "Feature",
      },
    });

    map.addLayer({
      id: `route${i}`,
      type: "line",
      source: `route${i}`,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#cccccc",
        "line-opacity": 0.5,
        "line-width": 13,
        "line-blur": 0.5,
      },
    });
  }
});

directions.on("route", (event) => {
  const reports = document.getElementById("reports");
  reports.innerHTML = "";
  const report = reports.appendChild(document.createElement("div"));
  // Add IDs to the routes
  const routes = event.route.map((route, index) => ({
    ...route,
    id: index,
  }));

  // Hide all routes by setting the opacity to zero.
  for (let i = 0; i < 3; i++) {
    map.setLayoutProperty(`route${i}`, "visibility", "none");
  }

  for (const route of routes) {
    // Make each route visible, by setting the opacity to 50%.
    map.setLayoutProperty(`route${route.id}`, "visibility", "visible");

    // Get GeoJSON LineString feature of route
    const routeLine = polyline.toGeoJSON(route.geometry);

    // Update the data for the route, updating the visual.
    map.getSource(`route${route.id}`).setData(routeLine);

    const isClear = turf.booleanDisjoint(obstacle, routeLine) === true;

    const collision = isClear ? "es accesible!" : "no es accesible.";

    const emoji = isClear ? "✔️" : "⚠️";
    const emoji1 = isClear ? "⚠️" : "⚠️";
    const emoji2 = isClear ? "✔️" : "⚠️";
    const emoji3 = isClear ? "✔️" : "⚠️";
    const detail = isClear ? "NO atraviesa" : "atraviesa";
    report.className = isClear ? "item" : "item warning";

    if (isClear) {
      map.setPaintProperty(`route${route.id}`, "line-color", "#74c476");
    } else {
      map.setPaintProperty(`route${route.id}`, "line-color", "#de2d26");
    }

    // Add a new report section to the sidebar.
    // Assign a unique `id` to the report.
    report.id = `report-${route.id}`;

    // Add the response to the individual report created above.
    const heading = report.appendChild(document.createElement("h3"));

    // Set the class type based on clear value.
    heading.className = isClear ? "title" : "warning";
    heading.innerHTML = `${emoji} Ruta ${route.id + 1} ${collision}`;

    // Add details to the individual report.
    const details = report.appendChild(document.createElement("div"));
    details.innerHTML = `Esta ruta ${detail} un elemento de accesibilidad fuera de servicio.${"<br />"}${"<br />"}${emoji1} NO2: 28ppm ${"<br />"}${"<br />"}${emoji2} Ruido: 74dB ${"<br />"}${"<br />"}${emoji3} Temp: 23ºC`;

    report.appendChild(document.createElement("hr"));
  }
});

$(".toggle-left-sidebar-display").click(function () {
  console.log($(".sidebar").css("width"))
  if ($(".sidebar").css("width") !== "1px") {
    $(".sidebar").css("width", 0);
    $("#map").css("left", 0);
    $("#map").css("width", "100%");
    // $(".directions-control.directions-control-inputs").css("display", "none")
    console.log($(".sidebar").css("width"))
  } else {
    $(".sidebar").css("width", "15%");
    $("#map").css("left", "15%");
    $("#map").css("width", "85%%");
  }
});
