const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.get("/station/:city", async (req, res) => {
//   const { city } = req.params;
//   const apiUrl = `https://transport.opendata.ch/v1/locations?query=${city}`;
//   try {
//     const response = await fetch(apiUrl);
//     const data = await response.json();

//     const stations = (data.stations || [])
//       .filter((station) => station.icon === "train")
//       .map((station) => ({
//         id: station.id,
//         name: station.name,
//         x: station.coordinate.x,
//         y: station.coordinate.y,
//         icon: station.icon,
//       }))[0];

//     res.json({ stations });
//   } catch (error) {
//     res.status(500).send("Error fetching station data");
//   }
// });

app.get("/station/:x/:y", async (req, res) => {
  const { x, y } = req.params;
  const apiUrl = `https://transport.opendata.ch/v1/locations?x=${x}&y=${y}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const stations = (data.stations || [])
      .filter((station) => station.icon === "train")
      .map((station) => ({
        id: station.id,
        name: station.name,
        x: station.coordinate.x,
        y: station.coordinate.y,
        icon: station.icon,
      }));

    res.json({ stations });
  } catch (error) {
    res.status(500).send("Error fetching station data");
  }
});

app.get("/connections/:from", async (req, res) => {
  const { from } = req.params;
  const apiUrl = `http://transport.opendata.ch/v1/stationboard?station=${from}&limit=5`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const connections = (data.stationboard || []).map((connection) => ({
      from: data.station?.name || from,
      to: connection.to,
      departure: connection.stop?.departure,
      arrival: null,
      duration: null,
      platform: connection.stop?.platform,
    }));

    res.json({ connections });
  } catch (error) {
    res.status(500).send("Error fetching connection data");
  }
});

app.get("/connections/:from/:to", async (req, res) => {
  const { from, to } = req.params;
  const apiUrl = `https://transport.opendata.ch/v1/connections?from=${from}&to=${to}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const connections = (data.connections || []).map((connection) => ({
      id: connection.from.station.id + connection.to.station.id,
      from: connection.from.station.name,
      to: connection.to.station.name,
      departure: connection.from.departure,
      arrival: connection.to.arrival,
      duration: connection.duration,
      platform: connection.from.platform,
    }));

    res.json({ connections });
  } catch (error) {
    res.status(500).send("Error fetching connection data");
  }
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
