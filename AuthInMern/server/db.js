const mongoose = require("mongoose");

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const username = "Avinash2489";
  const password = "Avinash@2489"; 
  const dbName = "SOCIALBOOK1";

  const encodedPassword = encodeURIComponent(password);
  const uri = `mongodb+srv://${username}:${encodedPassword}@cluster1.hudmw3h.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  try {
    mongoose.connect(uri, connectionParams);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    console.log("Could not connect to the database!");
  }
};
