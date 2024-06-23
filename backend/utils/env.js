require("dotenv").config();

const { PORT, NODE_ENV, SECRET } = process.env;

module.exports = { PORT, NODE_ENV, SECRET };