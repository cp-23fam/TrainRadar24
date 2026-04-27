const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/station/:city', async (req, res) => {
    const { city } = req.params;
    const apiUrl = `https://transport.opendata.ch/v1/locations?query=${city}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const stations = (data.stations || [])
            .filter(station => station.icon === 'train')
            .map(station => ({
                id: station.id,
                name: station.name,
                x: station.coordinate.x,
                y: station.coordinate.y,
                icon: station.icon
            }))[0];

        res.json({ stations });
        
    }
    catch (error) {
        res.status(500).send('Error fetching station data');
    }
});

app.get('/station/:x/:y', async (req, res) => {
    const { x, y } = req.params;
    const apiUrl = `https://transport.opendata.ch/v1/locations?x=${x}&y=${y}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const stations = (data.stations || [])
            .filter(station => station.icon === 'train')
            .map(station => ({
                id: station.id,
                name: station.name,
                x: station.coordinate.x,
                y: station.coordinate.y,
                icon: station.icon
            }))[0];

        res.json({ stations });
        
    }
    catch (error) {
        res.status(500).send('Error fetching station data');
    }
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});