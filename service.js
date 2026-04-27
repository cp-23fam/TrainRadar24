const express = require("express");

async function get_station(name) {
    try {
        const result = await fetch(`http://transport.opendata.ch/v1/locations?query=${name}`)
        const data = await result.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}

async function get_route(from, to) {
    try {
        const result = await fetch(`GET http://transport.opendata.ch/v1/connections?from=${from}&to=${to}`)
        const data = await result.json();
        return data;
        
    } catch (e) {
        console.log(e);
    }
}

const app = express();

app.get('/', async (req, res) => { 
    res.json("hello");
});

app.get('/station', async (req, res) => {
    try{
        const name = req.query.name;
        const data = await get_station(name); 
        res.json(data);
    }
    catch (e) {
        console.log(e);
    }
});

app.get('/route', async (req, res) => {
    try{
        const from = req.query.name;
        const to = req.query.name;
        const data = await get_route(from, to); 
        res.json(data);
    }
    catch (e) {
        console.log(e);
    }
});

app.listen(3000);

console.log("listen");


