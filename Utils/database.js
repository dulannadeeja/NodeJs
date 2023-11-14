const { MongoClient } = require('mongodb');
const username = encodeURIComponent("dulannadeeja");
const password = encodeURIComponent("dnA@123");
const cluster = "cluster0.wqsv7hi.mongodb.net";
let _db = null;
let uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

const mongoConnect = async (callback) => {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect('node_project');

        _db = client.db("node_project");

        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        callback();

    } catch (e) {
        console.error(e);
    }
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
}

module.exports.mongoConnect = mongoConnect;
module.exports.getDb = getDb;