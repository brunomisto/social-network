const { Sequelize } = require('sequelize');
const { NODE_ENV } = require("./utils/env");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: NODE_ENV === "TEST" ? "testdb.sqlite3" : "db.sqlite3",
  // logging: false,
});

const User = require("./models/user")(sequelize);
const Follow = require("./models/follow")(sequelize);
const Post = require("./models/post")(sequelize);

User.belongsToMany(User, {
  as: "follower",
  foreignKey: "FollowerUserId",
  through: Follow
});
User.belongsToMany(User, {
  as: "followed",
  foreignKey: "FollowedUserId",
  through: Follow
});

User.hasMany(Post, {
  foreignKey: {
    name: "OwnerUserId",
    allowNull: false,
  }
});
Post.belongsTo(User, {
  foreignKey: {
    name: "OwnerUserId",
    allowNull: false
  }
});

module.exports = {
  sequelize,
  User,
  Follow,
  Post
};