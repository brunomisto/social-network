const express = require("express");
const apiRouter = require("./api");

const app = express();

app.use("/api", apiRouter);

module.exports = app;