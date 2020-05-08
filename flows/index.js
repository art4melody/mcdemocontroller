'use strict';

const demos = require('../demos');
const mongodb = require('../db');
const collection = 'flows';
const FuelRest = require('fuel-rest');

/*
async function loadData() {
    states = await mongodb.load(collection)[0] || {};
    console.log(states);
}
*/

/*
// DEPRECATED
async function saveData() {
    await mongodb.save(collection, [states]);
}
*/

async function getState(demoName) {
    var data = await mongodb.get(collection, {name: demoName});

    if (!data) {
        await insertState();
        return 0;
    }

    return data.state;
}

async function setState(demoName, state) {
    let demo = await demos.getDemo(demoName);
    let numStates = demo.states.length || 0;
    if (numStates == 0) {
        state = 0;
    } else {
        state = (state % numStates);
    }

    await mongodb.upsert(collection, {name: demoName}, {name: demoName, state: state});
}

async function insertState(demoName) {
    await mongodb.insert(collection, {name: demoName, state: 0});
}

async function deleteState(demoName) {
    await mongodb.remove(collection, {name: demoName});
}

async function incrementState(demoName) {
    var state = await getState(demoName);
    await setState(demoName, state + 1);
}

async function decrementState(demoName) {
    var state = await getState(demoName);
    await setState(demoName, state - 1);
}

async function resetState(demoName) {
    await setState(demoName, 0);
}

async function runState(demoName) {
    let demo = await demos.getDemo(demoName);
    if (!demo) {
        console.log(`Demo ${demoName} NOT found.`);
        return;
    }

    let stateNo = await getState(demoName);
    let state = demo.states[stateNo];
    if (!state) {
        console.log(`State ${state} for demo ${demoName} NOT found.`);
        return;
    }

    let config = demo.config;
    // Currently support sends only
    let sendArray = state.send;
    if (!sendArray) return;

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

    setState(demoName, stateNo + 1);
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
    /*saveData, loadData,*/ 
    insertState, deleteState,
    getState, setState, incrementState, decrementState, resetState,
    runState
};