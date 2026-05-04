import "./style.css";
import { Map, View } from "ol";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { setLevel } from "ol/console";
import { fromLonLat, toLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Circle, Fill, Stroke } from "ol/style";

setLevel("warn");

let features = [];

const source = new VectorSource();
const vectorLayer = new VectorLayer({
  source: source,
  style: new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: "#e63946" }),
      stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
  }),
});

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  view: new View({
    center: [802614, 5973925],
    zoom: 10,
  }),
});

const view = map.getView();

let requested = null;
let timeout = false;

view.on("change:resolution", async () => {
  const host = "http://localhost:3000";
  const zoom = view.getZoom();

  if (zoom >= 14 && !requested) {
    requested = true;
    const center = view.getCenter();
    const points = toLonLat(center);

    const res = await fetch(`${host}/station/${points[0]}/${points[1]}`);
    const data = await res.json();

    for (const station of data.stations) {
      newPoint(station);
    }

    map.render();
    console.log(features);
  } else if (zoom < 14) {
    source.removeFeatures(features);
    features = [];
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
  });

  feature.setId(point.id);

  // feature.setStyle(
  //   new Style({
  //     fill: new Fill({
  //       color: "#ffffff",
  //     }),
  //   }),
  // );

  features.push(feature);
  source.addFeature(feature);
}
