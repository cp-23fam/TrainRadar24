const express = require("express");

const time_converter = require("./utils/time_converter");

async function get_station(name) {
    try {
        const result = await fetch(`http://transport.opendata.ch/v1/locations?query=${name}`);
        const data = await result.json();
        return data;
    } catch (e) {
        error(e);
    }
}

async function get_route(from, to) {
    try {
        const result = await fetch(`http://transport.opendata.ch/v1/connections?from=${from}&to=${to}`);
        const data = await result.json();
        return data;

    } catch (e) {
        error(e);
    }  
}

function error(error) {
    console.error(error);
}

const app = express();

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    res.json("hello");
});

app.get('/station', async (req, res) => {
    try {
        const name = req.query.name;

        const data = await get_station(name);

        res.json(data);
    }
    catch (e) {
        error(e);
    }
});

app.get('/route', async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;

        const data = await get_route(from, to);

        res.render('index', { title: 'TrainRadar', data: data, to_duration: time_converter.to_duration, to_date: time_converter.to_date });
    }
    catch (e) {
        error(e);
    }
});

app.listen(3000);

console.log("listen");


