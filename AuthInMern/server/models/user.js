const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// Define the schema for the "user" model
const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true }, // User's first name, required field
	lastName: { type: String, required: true }, // User's last name, required field
	email: { type: String, required: true }, // User's email address, required field
	password: { type: String, required: true }, // User's password, required field
	verified: { type: Boolean, default: false }, // User's email verification status, default: false
});

// Add a method to the userSchema to generate an authentication token (JWT)
userSchema.methods.generateAuthToken = function () {
	// Generate a new JWT with the user's ID (_id) as the payload
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d", // Token will expire after 7 days
	});
	return token;
};

// Create the "user" model based on the schema
const User = mongoose.model("user", userSchema);

// Validate user input data using Joi
const validate = (data) => {
	// Define a Joi schema for validation
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"), // First name must be a string and required
		lastName: Joi.string().required().label("Last Name"), // Last name must be a string and required
		email: Joi.string().email().required().label("Email"), // Email must be a valid email format and required
		password: passwordComplexity().required().label("Password"), // Password must meet complexity requirements and required
	});
	// Validate the data against the schema and return the result
	return schema.validate(data);
};

// Export the "user" model and the validate function for external use
module.exports = { User, validate };
