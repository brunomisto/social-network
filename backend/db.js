const { Sequelize } = require('sequelize');
const { NODE_ENV } = require("./utils/env");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: NODE_ENV === "TEST" ? "testdb.sqlite3" : "db.sqlite3",
});

const User = require("./models/user")(sequelize);

module.exports = {
  sequelize,
  User
};