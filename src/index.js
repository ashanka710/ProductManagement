const express = require("express");
const mongoose = require("mongoose");
const route = require("./route/route");
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const url = "";

mongoose
    .connect(url)
    .then(() => console.log("Mongos DB is connected"))
    .catch((err) => console.log(err));

app.use('/', route);

app.listen(port, function (req, res) {
    console.log('Express app running on port ' + port)
})