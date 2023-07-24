const mongoose = require("mongoose");

module.exports = () => {
  // Connection parameters for MongoDB
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Replace the following variables with your MongoDB Atlas credentials
  const username = "Avinash2489";
  const password = "Avinash@2489";
  const dbName = "SOCIALBOOK1";

  // Encode the password to handle special characters
  const encodedPassword = encodeURIComponent(password);

  // MongoDB connection URI, including credentials and database name
  const uri = `mongodb+srv://${username}:${encodedPassword}@cluster1.hudmw3h.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  try {
    // Attempt to connect to the MongoDB Atlas database using Mongoose
    mongoose.connect(uri, connectionParams);
    console.log("Connected to database successfully");
  } catch (error) {
    // If an error occurs during the connection attempt, log the error message
    console.log(error);
    console.log("Could not connect to the database!");
  }
};
