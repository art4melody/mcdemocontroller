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
    demos.addDemo(demo).then((result) => {
        if (!result) {
            flows.insertState(demo.name).then(() => {
                res.send('Data inserted.');
            });
        } else {
            res.status(400).send(result);
        }
    });
});

app.post('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    const newDemo = req.body;

    console.log(newDemo);
    demos.updateDemo(key, newDemo).then((result) => {
        if (!result) {
            res.send(key + ' is edited.');
        } else {
            res.status(400).send(result);
        }
    });
});

app.get('/api/v1/demos', (req, res) => {
    demos.getDemos().then((demos) => {
        res.json(demos);
    });
});

app.get('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    demos.getDemo(key).then((demo) => {
        if (demo) {
            res.json(demo);
        } else {
            res.status(404).send('Demo data not found.');
        }
    });
});

app.delete('/api/v1/demo/:key', (req, res) => {
    const key = req.params.key;
    demos.deleteDemo(key).then((result) => {
        if (!result) {
            flows.deleteState(key).then(() => {
                res.send(key + ' deleted.');
            });
        } else {
            res.status(400).send(result);
        }
    });
});

app.get('/api/v1/demo/flow/run/:key', (req, res) => {
    const key = req.params.key;
    flows.runState(key);
    res.send();
});

app.get('/api/v1/demo/flow/reset/:key', (req, res) => {
    const key = req.params.key;
    flows.resetState(key);
    res.send();
});

/*
// not needed anymore
demos.loadData();
flows.loadData();
*/

app.listen(process.env.PORT || port, () => {
    console.log('Server is listening on port ' + port);
});