'use strict';

const fs = require('fs');
const demos = require('../demos');

const FuelRest = require('fuel-rest');

let database = './flow.db.json';
let states = {};

function loadData() {
    try {
        console.log("Loading flow database: " + database);
        const data = fs.readFileSync(database);
        states = JSON.parse(data);
        console.log("Database loaded.");
    } catch (err) {
        console.log("Database couldn't be loaded. Check if file exists and data is not corrupted.");
        return false;
    }
    return true;
}

function saveData() {
    try {
        console.log("Saving flow database: " + database);
        let data = JSON.stringify(states);
        fs.writeFileSync(database, data);
        console.log("Database saved.");
    } catch (err) {
        console.log("Database couldn't be saved.");
        return false;
    }
    return true;
}

function getState(demoName) {
    if (!states[demoName]) {
        states[demoName] = 0;
        saveData();
    }

    return states[demoName];
}

function setState(demoName, state) {
    let demo = demos.getDemo(demoName);
    let numStates = demo.states.length || 0;
    if (numStates == 0) {
        state = 0;
    } else {
        state = (state % numStates);
    }

    states[demoName] = state;
    console.log(`Setting ${demoName} state to ${state}.`);
    saveData();
}

function incrementState(demoName) {
    setState(demoName, states[demoName]+1);
}

function decrementState(demoName) {
    setState(demoName, states[demoName]-1);
}

function resetState(demoName) {
    setState(demoName, 0);
}

function runState(demoName) {
    let demo = demos.getDemo(demoName);
    if (!demo) {
        console.log(`Demo ${demoName} NOT found.`);
        return;
    }

    let stateNo = getState(demoName);
    let state = demo.states[stateNo];
    if (!state) {
        console.log(`State ${state} for demo ${demoName} NOT found.`);
        return;
    }

    let config = demo.config;
    // Currently support sends only
    let sendArray = state.send;

    console.log(`Demo ${demoName} state is ${stateNo}.`);
    sendArray.forEach(send => {
        switch (send.channel.toLowerCase()) {
            case "email":
                sendEmail(config, send);
                break;
            case "sms":
                sendSMS(config, send);
                break;
            case "push":
                sendPush(config, send);
                break;
        }
    });
}

function sendPush(config, send) {
    let pushTemplateId = send.templateId;
    let listId = send.listId;
    const options = {
        auth: {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            authUrl: config.authURL + '/v1/requestToken'
        },
        restEndpoint: config.apiURL,
        retry: true,
        uri: '/push/v1/messageList/' + pushTemplateId + '/send',
        json: true,
        body: {
            "InclusionListIds": [
                listId
            ]
        }
    };

    const RestClient = new FuelRest(options);
    console.log(`Sending push with template ${pushTemplateId} to list ${listId}.`);
    RestClient.post(options, (err, response) => {
        if (err) {
            // error here
            console.log(`Send push ERR: ${err}.`);
            return;
        }
    
        // will be delivered with 200, 400, 401, 500, etc status codes
        // response.body === payload from response
        // response.res === full response from request client
        console.log(`Send push SUCCESS:`);
        console.log(response.body);
    });
}

function sendSMS(config, send) {
    let templateId = send.templateId;
    let mobileNumbers = send.mobileNumbers;
    let overrideMessage = send.messageTextOverride || false;

    const options = {
        auth: {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            authUrl: config.authURL + '/v1/requestToken'
        },
        restEndpoint: config.apiURL,
        retry: true,
        uri: '/sms/v1/messageContact/' + templateId + '/send',
        json: true,
        body: {
            "mobileNumbers": mobileNumbers,
            "Subscribe": false,
            "Resubscribe": false
        }
    };

    if (!overrideMessage) {
        options.body.Override = true;
        options.body.messageText = overrideMessage;
    }

    const RestClient = new FuelRest(options);
    console.log(`Sending SMS with template ${templateId} to list ${mobileNumbers}.`);
    RestClient.post(options, (err, response) => {
        if (err) {
            // error here
            console.log(`Send SMS ERR: ${err}.`);
            return;
        }
    
        // will be delivered with 200, 400, 401, 500, etc status codes
        // response.body === payload from response
        // response.res === full response from request client
        console.log(`Send SMS SUCCESS:`);
        console.log(response.body);
    });
}

function sendEmail(config, send) {
    let triggeredEmailExternalKey = send.triggeredEmailExternalKey;
    let email = send.email;
    let customerKey = send.customerKey;
    let attributes = send.attributes || false;

    const options = {
        auth: {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            authUrl: config.authURL + '/v1/requestToken'
        },
        restEndpoint: config.apiURL,
        retry: true,
        uri: '/messaging/v1/messageDefinitionSends/key:' + triggeredEmailExternalKey + '/send',
        json: true,
        body: {
            "To": {
                "Address": email,
                "SubscriberKey": customerKey
            }
        }
    };

    if (!attributes) {
        options.body.ContactAttributes = {
            "SubscriberAttributes": attributes
        };
    }

    const RestClient = new FuelRest(options);
    console.log(`Sending email with template ${triggeredEmailExternalKey} to email ${email}.`);
    RestClient.post(options, (err, response) => {
        if (err) {
            // error here
            console.log(`Send email ERR: ${err}.`);
            return;
        }
    
        // will be delivered with 200, 400, 401, 500, etc status codes
        // response.body === payload from response
        // response.res === full response from request client
        console.log(`Send email SUCCESS:`);
        console.log(response.body);
    });
}

module.exports = {
    saveData, loadData, 
    getState, setState, incrementState, decrementState, resetState,
    runState
};