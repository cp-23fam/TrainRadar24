import "./style.css";
import { Map, View, Overlay } from "ol";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { setLevel } from "ol/console";
import { fromLonLat, toLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Circle, Fill, Stroke, Icon } from "ol/style";
import trainIcon from "./assets/train.png";

setLevel("warn");

let stations = [];
let trains = [];

const soncebozCoords = [7.168766, 47.19515]; // [lon, lat]
const corgémontCoords = [7.144666, 47.193399];

const stationsSource = new VectorSource();
const stationsLayers = new VectorLayer({
  source: stationsSource,
  style: new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: "#e63946" }),
      stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
  }),
});

const trainsSource = new VectorSource();
const trainLayers = new VectorLayer({
  source: trainsSource,
  style: new Style({
    image: new Icon({
      src: trainIcon,
      scale: 0.08,
      anchor: [0.5, 0.5],
    }),
  }),
});

const centerCoords = fromLonLat([
  (soncebozCoords[0] + corgémontCoords[0]) / 2,
  (soncebozCoords[1] + corgémontCoords[1]) / 2,
]);

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    stationsLayers,
    trainLayers,
  ],
  view: new View({
    center: centerCoords,
    zoom: 14,
  }),
});

const view = map.getView();

let requested = null;
let timeout = false;

// Overlay pour les infos au survol
const overlayElement = document.createElement("div");
overlayElement.className = "overlay";
overlayElement.id = "overlay";
document.body.appendChild(overlayElement);

const overlay = new Overlay({
  element: overlayElement,
  autoPan: true,
  autoPanAnimation: { duration: 250 },
});
map.addOverlay(overlay);

// Détecteur de survol
map.on("pointermove", (evt) => {
  if (evt.dragging) {
    overlay.setPosition(undefined);
    return;
  }

  const pixel = map.getEventPixel(evt.originalEvent);
  let hasFeature = false;

  map.forEachFeatureAtPixel(pixel, (feature) => {
    const props = feature.getProperties();
    let content = "";

    if (props.name) {
      // C'est une gare
      content = `<strong>${props.name}</strong>`;
    } else if (props.schedule) {
      // C'est un train
      const schedule = props.schedule;
      const from = schedule.from;
      const to = schedule.to;
      const depTime = new Date(schedule.departure).toLocaleTimeString(
        "fr-FR",
        { hour: "2-digit", minute: "2-digit" }
      );
      const arrTime = new Date(schedule.arrival).toLocaleTimeString(
        "fr-FR",
        { hour: "2-digit", minute: "2-digit" }
      );
      content = `<strong>Train</strong><br/>${depTime} → ${arrTime}`;
    }

    if (content) {
      overlayElement.innerHTML = content;
      overlay.setPosition(evt.coordinate);
      hasFeature = true;
    }
  });

  if (!hasFeature) {
    overlay.setPosition(undefined);
  }
});

// Train en dur: Sonceboz -> Corgémont
const now = new Date();
const departure = new Date(now.getTime());
const arrival = new Date(now.getTime() + 30 * 60000); // 30 minutes plus tard

addHardcodedTrain(
  soncebozCoords,
  corgémontCoords,
  "hardcoded-train-sonceboz-corgémont",
  departure.toISOString(),
  arrival.toISOString(),
);

view.on("change:resolution", async () => {
  const host = "http://localhost:3000";
  const zoom = view.getZoom();

  if (zoom >= 13 && !requested) {
    requested = true;
    const center = view.getCenter();
    const points = toLonLat(center);

    const res = await fetch(`${host}/station/${points[0]}/${points[1]}`);
    const data = await res.json();

    const stations = stationsSource.getFeatures();

    for (const departure of stations) {
      for (const arrival of stations) {
        const departureId = departure.getId();
        const arrivalId = arrival.getId();

        const connections = await fetch(
          `${host}/connections/${departureId}/${arrivalId}`,
        );

        const connectionData = await connections.json();

        console.log(connectionData);

        newTrain(connectionData, departure, arrival);
      }
    }

    for (const station of data.stations) {
      newPoint(station);
    }

    map.render();
  } else if (zoom < 13) {
    stationsSource.removeFeatures(stations);
    trainsSource.removeFeatures(trains);
    stations = [];
    trains = [];
    map.render();
  }

  if (!timeout) {
    timeout = true;
    setTimeout(() => {
      requested = null;
      timeout = false;
    }, 1000);
  }
});

function newPoint(point) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([point.y, point.x])),
    name: point.name,
  });

  const existing = stationsSource.getFeatureById(point.id);
  if (existing !== null) {
    return;
  }

  feature.setId(point.id);

  stations.push(feature);
  stationsSource.addFeature(feature);
}

function newTrain(train, departure, arrival) {
  const dCords = toLonLat(departure.getGeometry().getCoordinates());
  const aCords = toLonLat(arrival.getGeometry().getCoordinates());

  if (train.connections.length < 1) {
    return;
  }

  const feature = new Feature({
    geometry: new Point(fromLonLat([train.y, train.x])),
  });

  feature.setProperties({
    schedule: {
      departure: train.connections[0].departure,
      arrival: train.connections[0].arrival,
      from: dCords,
      to: aCords,
    },
  });
  feature.setId(train.id);

  trains.push(feature);
  trainsSource.addFeature(feature);
}

function addHardcodedTrain(fromCoords, toCoords, trainId, departureTime, arrivalTime) {
  const feature = new Feature({
    geometry: new Point(fromLonLat(fromCoords)),
  });

  feature.setProperties({
    schedule: {
      departure: departureTime,
      arrival: arrivalTime,
      from: fromCoords,
      to: toCoords,
    },
  });
  feature.setId(trainId);

  trains.push(feature);
  trainsSource.addFeature(feature);
}

setInterval(() => {
  const now = new Date();

  for (const train of trainsSource.getFeatures()) {
    const props = train.getProperties().schedule;

    const departure = Date.parse(props.departure);
    const arrival = Date.parse(props.arrival);

    const t = (now - departure) / (arrival - departure);

    console.log(t);

    train.setGeometry(
      new Point(
        fromLonLat([
          props.from[0] + t * (props.to[0] - props.from[0]),
          props.from[1] + t * (props.to[1] - props.from[1]),
        ]),
      ),
    );
  }
}, 2000);
