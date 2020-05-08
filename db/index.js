'use strict';

const MongoClient = require('mongodb').MongoClient;
const dbname = "mcdemo";
let connectionOptions = {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}
let db, client;

/*
// DEPRECATED
async function save(collection, data) {
    try {
        console.log("Saving database: " + collection);
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db(dbname);
        
        await db.collection(collection).save(data, {w: 0});
        console.log("Database " + collection + " saved.");
    }
    catch (err) {
        console.error(err);
    }
    finally {
        client.close();
    }
}
*/

async function load(collection) {
    try {
        console.log("Loading database: " + collection);
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db();
        
        var data = await db.collection(collection).find().toArray();
        console.log("Database " + collection + " loaded.");

        return data;
    }
    catch (err) {
        console.error(err);
    }
    finally {
        client.close();
    }
}

async function get(collection, query) {
    try {
        console.log("Getting from " + collection + ": " + JSON.stringify(query));
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db();
        
        var data = await db.collection(collection).findOne(query);
        console.log("Retrieved: " + JSON.stringify(data));

        return data;
    }
    catch (err) {
        console.error(err);
    }
    finally {
        client.close();
    }
}

async function insert(collection, data) {
    try {
        console.log("Inserting to " + collection + ": " + JSON.stringify(data));
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db();
        
        var r = await db.collection(collection).insertOne(data);
        console.log("Inserted " + r.insertedCount + " record");
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
    finally {
        client.close();
    }
}

async function update(collection, query, data) {
    try {
        console.log("Updating to " + collection + ": " + JSON.stringify(query) + " -> " + JSON.stringify(data));
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db();
        
        var r = await db.collection(collection).updateOne(query, { $set: data });
        console.log("Updated " + r.modifiedCount + " record");
        if (r.modifiedCount > 0) return true; else return false;
    }
    catch (err) {
        console.error(err);
        return false;
    }
    finally {
        client.close();
    }
}

async function upsert(collection, query, data) {
    try {
        console.log("Upserting to " + collection + ": " + JSON.stringify(query) + " -> " + JSON.stringify(data));
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db();
        
        var r = await db.collection(collection).updateOne(query, { $set: data }, { upsert: true });
        console.log("Upserted " + r.modifiedCount + " record");
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
    finally {
        client.close();
    }
}

async function remove(collection, query) {
    try {
        console.log("Deleting to " + collection + ": " + JSON.stringify(query));
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db();
        
        var r = await db.collection(collection).deleteOne(query);
        console.log("Deleted " + r.deletedCount + " record");
        if (r.deletedCount > 0) return true; else return false;
    }
    catch (err) {
        console.error(err);
        return false;
    }
    finally {
        client.close();
    }
}

async function removeAll(collection) {
    try {
        console.log("Deleting to " + collection + ": " + JSON.stringify(query));
        client = await MongoClient.connect(process.env.MONGODB_URI, connectionOptions);
        db = client.db();
        
        var r = await db.collection(collection).deleteMany({});
        console.log("Deleted " + r.deletedCount + " record");
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
    finally {
        client.close();
    }
}


module.exports = {
    load, get, insert, update, upsert, remove, removeAll
};