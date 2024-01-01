const mongoose = require('mongoose');
const config = require('../config.json');


console.log('Called mongodb internal system.')
connectMongoose()

async function connectMongoose() {
	try {
		await mongoose.connect(`mongodb://${config.mongoDBuser}:${config.mongoDBpass}@${config.mongoDBhost}:${config.mongoDBport}/${config.mongoDBdatabase}?authSource=admin`);
	} catch (e) {
		console.log(e)
	}
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

module.exports = {
	connection: db,
	mongoose: mongoose
};