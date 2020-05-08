'use strict';

const uuidv4 = require('uuid/v4');
const mongodb = require('../db');
const collection = 'demos';

/*
async function loadData() {
    demos = await mongodb.load(collection) || [];
    console.log(demos);
}
*/

/*
// DEPRECATED
async function saveData() {
    await mongodb.save(collection, demos);
}
]*/

async function demoExists(demo) {
    let name;
    if (typeof(demo) === "string") {
        name = demo;
    } else if (typeof(demo) === "object") {
        if (!demo.name) return true;
        name = demo.name;
    }

    var r = await mongodb.get(collection, {name: name});
    if (!r) {
        console.log(`Demo '${name}' does NOT exists in the database.`);
        return false;
    }
    
    console.log(`Demo '${name}' exists in the database.`);
    return true;
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

async function addDemo(demo) {
    if (await demoExists(demo)) {
        return `Demo NOT added. Data with the name ${demo.name} already exists.`;
    }
    let msg = validateDemoData(demo);
    if (msg) return msg;

    let now = new Date();
    demo.createdDate = now.toJSON();
    demo.updatedDate = now.toJSON();

    demo.id = uuidv4();

    var r = await mongodb.insert(collection, demo);
    return !r;
}

async function updateDemo(name, demo) {
    /*
    // No need to check anymore
    if (!await demoExists(demo)) {
        return `Demo with the name ${demo.name} NOT found.`;
    }
    */
    let msg = validateDemoData(demo);
    if (msg) return msg;

    let now = new Date();
    demo.updatedDate = now.toJSON();

    var r = await mongodb.update(collection, {name: name}, demo);
    return !r;
}

async function deleteDemo(demo) {
    let name;
    if (typeof(demo) === "string") {
        name = demo;
    } else if (typeof(demo) === "object") {
        if (!demo.name) {
            return `Delete operation aborted. Demo name not found.`;
        }
        name = demo.name;
    }

    var r = await mongodb.remove(collection, {name: name});
    return !r;
}

async function getDemos() {
    var data = await mongodb.load(collection);
    return data;
}

async function getDemo(name) {
    if (typeof(name) !== "string") {
        console.log(`Format mismatch.`);
        return null;
    }
    
    var data = await mongodb.get(collection, {name: name});
    return data;
}

module.exports = {
    /*saveData, loadData,*/
    getDemo, getDemos, addDemo, updateDemo, deleteDemo
};