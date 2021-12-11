const { MongoClient } = require('mongodb');
const { getEnvVar } = require('./../env');
const publicIp = require('public-ip');

let db = null;
async function connnectMongoDb() {
    const uri = getEnvVar("MONGODB_URL");
    const client = new MongoClient(uri, {
        useNewUrlParser: true
      });
  
    try {
        await client.connect();
        db = client.db("deamon_log");
    } catch (e) {
        console.error(e);
    }
}

async function closeDB() {
    await client.close();
    db = null;
}

async function insertHistory(url, title)
{
    let ip = await publicIp.v4();
    if (db == null)
    {
        console.log("db null");
        return;
    }
    db.collection('visited_urls', function (err, collection) {
        if( err ) throw err;
        collection.insertOne({ ip_address: ip, visited_url: url, title, created_at: new Date(), updated_at: new Date() });
    });
}

module.exports = {
    connnectMongoDb,
    closeDB,
    insertHistory
};