const mongoose = require("mongoose");
require("dotenv").config();
const connection = process.env.MONGO_URL_PROD;
mongoose
  .connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 90000,
    serverSelectionTimeoutMS: 90000,
  })
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.error(err));
