const router = require("express").Router();
const { User } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require("bcrypt");

// Login
router.post("/login", async (req, res) => {
  try {
    // Validate login request data using Joi schema
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Find the user with the provided email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // Compare the provided password with the user's hashed password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // Check if the user is not verified
    if (!user.verified) {
      // Generate a token for email verification if it doesn't exist
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
        // Send an email to the user for email verification
        await sendEmail(user.email, "Verify Email", url);
      }

      // Return a response indicating that the email verification link has been sent
      return res
        .status(400)
        .send({ message: "An Email sent to your account please verify" });
    }

    // Generate an authentication token for the user and send it in the response
    const authToken = user.generateAuthToken();
    res.status(200).send({ data: authToken, message: "logged in successfully" });
  } catch (error) {
    // Handle any internal server errors
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Password Reset: Send password reset link
router.post("/password-reset", async (req, res) => {
  try {
    // Validate the request body containing the user's email using Joi schema
    const emailSchema = Joi.object({
      email: Joi.string().email().required().label("Email"),
    });
    const { error } = emailSchema.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Find the user with the provided email
    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(409)
        .send({ message: "User with given email does not exist!" });

    // Generate a token for password reset if it doesn't exist
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    // Compose the URL for password reset and send it via email
    const url = `${process.env.BASE_URL}password-reset/${user._id}/${token.token}/`;
    await sendEmail(user.email, "Password Reset", url);

    // Return a response indicating that the password reset link has been sent
    res
      .status(200)
      .send({ message: "Password reset link sent to your email account" });
  } catch (error) {
    // Handle any internal server errors
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Password Reset: Verify password reset link
router.get("/password-reset/:id/:token", async (req, res) => {
  try {
    // Find the user with the provided ID
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    // Find the token associated with the user and provided token
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    // Return a response indicating that the URL is valid
    res.status(200).send("Valid Url");
  } catch (error) {
    // Handle any internal server errors
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Password Reset: Set new password
router.post("/password-reset/:id/:token", async (req, res) => {
  try {
    // Validate the request body containing the new password using Joi schema
    const passwordSchema = Joi.object({
      password: passwordComplexity().required().label("Password"),
    });
    const { error } = passwordSchema.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Find the user with the provided ID
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    // Find the token associated with the user and provided token
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    // If the user is not verified, mark them as verified
    if (!user.verified) user.verified = true;

    // Generate a salt and hash the new password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Update the user's password and remove the token from the database
    user.password = hashPassword;
    await user.save();
    await token.remove();

    // Return a response indicating that the password reset was successful
    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    // Handle any internal server errors
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Joi schema for validating login data
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
