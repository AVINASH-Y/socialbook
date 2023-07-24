const router = require("express").Router();
const { User, validate } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");

// POST request to create a new user and send a verification email
router.post("/", async (req, res) => {
	try {
		// Validate the request body using the defined schema in the User model
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		// Check if a user with the provided email already exists
		let user = await User.findOne({ email: req.body.email });
		if (user)
			return res
				.status(409)
				.send({ message: "User with given email already exists!" });

		// Generate a salt and hash the user's password
		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		// Create a new User with the hashed password and save it to the database
		user = await new User({ ...req.body, password: hashPassword }).save();

		// Generate a verification token and save it to the database
		const token = await new Token({
			userId: user._id,
			token: crypto.randomBytes(32).toString("hex"),
		}).save();

		// Compose the verification URL with the token and send a verification email
		const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
		await sendEmail(user.email, "Verify Email", url);

		// Respond with a success message
		res
			.status(201)
			.send({ message: "An email sent to your account, please verify." });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});

// GET request to verify the user's email using the verification token
router.get("/:id/verify/:token/", async (req, res) => {
	try {
		// Find the user with the provided ID
		const user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(400).send({ message: "Invalid link" });

		// Find the verification token associated with the user
		const token = await Token.findOne({
			userId: user._id,
			token: req.params.token,
		});
		if (!token) return res.status(400).send({ message: "Invalid link" });

		// Mark the user as verified and remove the used verification token
		await User.updateOne({ _id: user._id, verified: true });
		await token.remove();

		// Respond with a success message
		res.status(200).send({ message: "Email verified successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;
