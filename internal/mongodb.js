const mongoose = require("mongoose");
const config = require("../config.json");
const { LANG } = require("../util/languages");

console.log(LANG.internal.mongodb.called);
connectMongoose();

async function connectMongoose() {
	try {
		await mongoose.connect(
			`mongodb://${config.mongoDBuser}:${config.mongoDBpass}@${config.mongoDBhost}:${config.mongoDBport}/${config.mongoDBdatabase}?authSource=admin`,
		);
	} catch (e) {
		console.log(e);
	}
}

const db = mongoose.connection;
db.on("connecting", function () {
	console.log(LANG.internal.mongodb.dbConnecting);
});
db.on("connected", function () {
	console.log(LANG.internal.mongodb.dbConnected);
});
db.on("disconnecting", function () {
	console.log(LANG.internal.mongodb.dbDisconnecting);
});
db.on("disconnected", function () {
	console.log(LANG.internal.mongodb.dbDisconnected);
});

module.exports = {
	connection: db,
	mongoose: mongoose,
};
