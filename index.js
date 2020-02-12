'use strict';

const demos = require('./demos');
const flows = require('./flows');

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
    let result = demos.addDemo(demo);
    if (!result) {
        res.send('Data inserted.');
    } else {
        res.status(400).send(result);
    }
});

app.post('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    const newDemo = req.body;

    console.log(newDemo);
    let result = demos.updateDemo(key, newDemo);
    if (!result) {
        res.send(key + ' is edited.');
    } else {
        res.status(400).send(result);
    }
});

app.get('/api/v1/demos', (req, res) => {
    res.json(demos.getDemos());
});

app.get('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    let demo = demos.getDemo(key);

    if (demo) {
        res.json(demo);
    } else {
        res.status(404).send('Demo data not found.');
    }
});

app.delete('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    let result = demos.deleteDemo(key);

    if (!result) {
        res.send(key + ' deleted.');
    } else {
        res.status(400).send(result);
    }
});

app.get('/api/v1/demo/flow/run/:key', (req, res) => {
    const key = req.params.key;
    flows.runState(key);
    flows.incrementState(key);
    res.send();
});

app.get('/api/v1/demo/flow/reset/:key', (req, res) => {
    const key = req.params.key;
    flows.resetState(key);
    res.send();
});

demos.loadData();
flows.loadData();
app.listen(process.env.PORT || port, () => {
    console.log('Server is listening on port ' + port);
});