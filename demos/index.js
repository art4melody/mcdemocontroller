'use strict';

const uuidv4 = require('uuid/v4');
const fs = require('fs');

let database = './demo.db.json';
let demos = [];

function loadData() {
    try {
        console.log("Loading demo database: " + database);
        if (!fs.existsSync(database)) {
            console.log("Database file does not exist. Creating one.");
            fs.writeFileSync(database, '[]');
        }
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

function validateDemoData(demo) {
    if (typeof(demo) !== 'object' || Array.isArray(demo)) {
        return "Demo NOT valid. Data format mismatch.";
    }
    if (!demo.name) {
        return "Demo NOT valid. Demo name not found.";
    }
    if (!demo.config) {
        return "Demo NOT valid. Demo config not found.";
    }
    if (!demo.config.clientId || !demo.config.clientSecret) {
        return "Demo NOT valid. ClientId or ClientSecret config not found.";
    }
    if (!demo.config.apiURL) {
        return "Demo NOT valid. API URL config not found.";
    }
    if (!demo.config.authURL) {
        return "Demo NOT valid. Auth URL config not found.";
    }
    if (!demo.states) {
        return "Demo NOT valid. States not found.";
    }
    if (!Array.isArray(demo.states)) {
        return "Demo NOT valid. States has to be an array.";
    }
    for (let i = 0; i < demo.states.length; i++) {
        let state = demo.states[i];
        if (state.send) {
            if (!Array.isArray(state.send)) {
                return "Demo NOT valid. State send attribute has to be an array.";
            }
            for (let j = 0; j < state.send.length; j++) {
                let send = state.send[j];
                if (!send.channel) {
                    return "Demo NOT valid. State send has to have channel attribute.";
                }
                switch(send.channel.toLowerCase()) {
                    case "email":
                        if (!send.triggeredEmailExternalKey || !send.email || !send.customerKey) {
                            return "Demo NOT valid. Email send has to have triggeredEmailExternalKey, email, customerKey attributes.";
                        }
                        break;
                    case "sms":
                        if (!send.templateId || !send.mobileNumbers) {
                            return "Demo NOT valid. SMS send has to have templateId, mobileNumbers attributes.";
                        }
                        if (!Array.isArray(send.mobileNumbers)) {
                            return "Demo NOT valid. SMS send mobileNumbers attribute has to be an array.";
                        }
                        break;
                    case "push":
                        if (!send.templateId || !send.listId) {
                            return "Demo NOT valid. Push send has to have templateId, listId attributes.";
                        }
                        break;
                }
            }
        }
    }
    return false;
}

function addDemo(demo) {
    if (demoExists(demo)) {
        return `Demo NOT added. Data with the name ${demo.name} already exists.`;
    }
    let msg = validateDemoData(demo);
    if (msg) return msg;

    let now = new Date();
    demo.createdDate = now.toJSON();
    demo.updatedDate = now.toJSON();

    demo.id = uuidv4();

    demos.push(demo);
    console.log(`Demo ${demo.name} updated.`);

    saveData();
    return false;
}

function updateDemo(name, demo) {
    if (!demoExists(demo)) {
        return `Demo NOT updated. Data with the name ${demo.name} already exists.`;
    }
    let msg = validateDemoData(demo);
    if (msg) return msg;

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
    return false;
}

function deleteDemo(demo) {
    let name;
    if (typeof(demo) === "string") {
        name = demo;
    } else if (typeof(demo) === "object") {
        if (!demo.name) {
            return `Delete operation aborted. Demo name not found.`;
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

    if (initialSize == demos.length) {
        return "Nothing is deleted.";
    }

    return false;
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