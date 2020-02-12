'use strict';

const uuidv4 = require('uuid/v4');
const fs = require('fs');

let database = './demo.db.json';
let demos = [];

function loadData() {
    try {
        console.log("Loading demo database: " + database);
        const data = fs.readFileSync(database);
        demos = JSON.parse(data);
        console.log("Database loaded.");
    } catch (err) {
        console.log("Database couldn't be loaded. Check if file exists and data is not corrupted.");
        return false;
    }
    return true;
}

function saveData() {
    try {
        console.log("Saving demo database: " + database);
        let data = JSON.stringify(demos);
        fs.writeFileSync(database, data);
        console.log("Database saved.");
    } catch (err) {
        console.log("Database couldn't be saved.");
        return false;
    }
    return true;
}

function demoExists(demo) {
    let name;
    if (typeof(demo) === "string") {
        name = demo;
    } else if (typeof(demo) === "object") {
        if (!demo.name) return true;
        name = demo.name;
    }
    
    for (let i = 0; i < demos.length; i++) {
        if (demos[i].name === name) {
            console.log(`Demo '${name}' exists in the database.`);
            return true;
        }
    }
    console.log(`Demo '${name}' does NOT exists in the database.`);
    return false;
}

function addDemo(demo) {
    if (demoExists(demo)) {
        console.log("Demo NOT added.");
        return false;
    }
    if (typeof(demo) !== 'object') {
        console.log("Demo NOT added. Data format mismatch.");
        return false;
    }
    if (!demo.name) {
        console.log("Demo NOT added. Demo name not found.");
        return false;
    }

    let now = new Date();
    demo.createdDate = now.toJSON();
    demo.updatedDate = now.toJSON();

    demo.id = uuidv4();

    demos.push(demo);
    console.log(`Demo ${demo.name} updated.`);

    saveData();
    return true;
}

function updateDemo(name, demo) {
    if (!demoExists(demo)) {
        console.log("Demo NOT updated.");
        return false;
    }
    if (typeof(demo) !== 'object') {
        console.log("Demo NOT updated. Data format mismatch.");
        return false;
    }
    if (!demo.config || !demo.states) {
        console.log("Demo NOT updated. No data to update.");
        return false;
    }

    for (let i = 0; i < demos.length; i++) {
        if (demos[i].name === name) {
            let now = new Date();
            demos[i].updatedDate = now.toJSON();

            demos[i].config = demo.config;
            demos[i].states = demo.states;

            console.log(`Demo ${name} updated.`);
        }
    }

    saveData();
    return true;
}

function deleteDemo(demo) {
    let name;
    if (typeof(demo) === "string") {
        name = demo;
    } else if (typeof(demo) === "object") {
        if (!demo.name) {
            console.log(`Delete operation aborted. Demo name not found.`);
            return false;
        }
        name = demo.name;
    }
    let initialSize = demos.length;
    demos = demos.filter((value, index, arr) => {
        return value.name != name;
    });

    if (initialSize != demos.length) {
        console.log(`Demo ${name} deleted.`);
    } else {
        console.log(`Demo ${name} NOT found.`);
    }

    saveData();

    return (initialSize != demos.length);
}

function getDemos() {
    return demos;
}

function getDemo(name) {
    if (typeof(name) !== "string") {
        console.log(`Format mismatch.`);
        return null;
    }
    for (let demo of demos) {
        if (demo.name === name) {
            return demo;
        }
    }
    return null;
}

module.exports = {
    saveData, loadData,
    getDemo, getDemos, addDemo, updateDemo, deleteDemo
};