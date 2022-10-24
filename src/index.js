require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const route = require("./routes/route");
const app = express();
const multer = require('multer')

app.use(express.json());
app.use(multer().any())
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT
const url = process.env.MONGODB_URL

mongoose.connect(url)
    .then(() => console.log("Mongos DB is connected"))
    .catch((err) => console.log(err));

app.use('/', route);


app.listen(port, function (req, res) {
    console.log('Express app running on port ' + port)
})