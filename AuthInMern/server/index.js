// Load environment variables from .env file
require("dotenv").config();

// Import required modules
const express = require("express");
const app = express();
const cors = require("cors");

// Import the database connection function from the db.js file
const connection = require("./db");

// Establish a connection to the database using the connection function
connection();

// Middleware setup
// Parse incoming JSON data in requests
app.use(express.json());
// Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins
app.use(cors());

// Import and set up the routes for the user and authentication endpoints
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
// These routes will be accessible at /api/users and /api/auth respectively
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Define the port on which the server will listen, using the PORT environment variable if available, or defaulting to port 8080
const port = process.env.PORT || 8080;

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
