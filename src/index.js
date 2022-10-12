const express = require("express");
const mongoose = require("mongoose");
const route = require("./routes/route");
const app = express();
const multer = require('multer')

app.use(express.json());
app.use(multer().any())
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const url = "mongodb+srv://Ashanka1:24Ashanka123@cluster0.yd6fjme.mongodb.net/group36Database";

mongoose.connect(url)
    .then(() => console.log("Mongos DB is connected"))
    .catch((err) => console.log(err));

app.use('/', route);

app.listen(port, function (req, res) {
    console.log('Express app running on port ' + port)
})