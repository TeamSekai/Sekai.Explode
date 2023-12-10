const mongoose = require('mongoose');
const config = require('../config.json');
connectMongoose().catch(err => console.log(err));

async function connectMongoose() {
	await mongoose.connect(`mongodb://${config.mongoDBuser}:${config.mongoDBpass}@${config.mongoDBhost}:${config.mongoDBport}/${config.mongoDBdatabase}`);
}


const db = mongoose.connection;
db.on("connecting", function () {
    console.log(`[MongoDB] Connecting...`)
});
db.on("connected", function () {
    console.log(`[MongoDB] Connected!`)
});
db.on("disconnecting", function () {
    console.log(`[MongoDB] Disconnecting...`)
});
db.on("disconnected", function () {
    console.log(`[MongoDB] Disconnected!`)
});
export { db as connection, mongoose };