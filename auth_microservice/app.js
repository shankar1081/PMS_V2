const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const app = express();
const PORT = 8000;

mongoose
  .connect("mongodb://127.0.0.1:27017/PMS_USER", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(bodyParser.json());
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Auth microservice is running on port ${PORT}`);
});
