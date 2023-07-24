require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");

// Database connection
connection();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");


app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
