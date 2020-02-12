'use strict';

const models = require('./models');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Congigure body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/v1/demo', (req, res) => {
    const demo = req.body;

    console.log(demo);
    let result = models.addDemo(demo);
    if (result) {
        res.send('Data inserted.');
    } else {
        res.send('Not modified.');
    }
});

app.post('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    const newDemo = req.body;

    let result = models.updateDemo(key, newDemo);

    if (result) {
        res.send(key + ' is edited.');
    } else {
        res.send('Not modified.');
    }
});

app.get('/api/v1/demos', (req, res) => {
    res.json(models.getDemos());
});

app.get('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    let demo = models.getDemo(key);

    if (demo) {
        res.json(demo);
    } else {
        res.status(404).send('Demo data not found.');
    }
});

app.delete('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    let result = models.deleteDemo(key);

    if (result) {
        res.send(key + ' deleted.');
    } else {
        res.send('Nothing deleted.');
    }
});

models.loadData();
app.listen(port, () => {
    console.log('Server is listening on port ' + port);
});