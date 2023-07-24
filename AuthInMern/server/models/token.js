const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for the "token" model
const tokenSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId, // The type is an ObjectId
		required: true, // It is a required field
		ref: "user", // It references the "user" model (collection)
		unique: true, // It should be unique (one token per user)
	},
	token: {
		type: String, // The type is a String
		required: true, // It is a required field
	},
	createdAt: {
		type: Date, // The type is a Date
		default: Date.now, // It defaults to the current date and time
		expires: 3600, // The token will automatically expire after 3600 seconds (1 hour)
	},
});

// Create and export the "token" model based on the schema
module.exports = mongoose.model("token", tokenSchema);
