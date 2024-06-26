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
const Like = require("./models/like")(sequelize);

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

Post.hasMany(Like, {
  foreignKey: {
    allowNull: false
  }
});
Like.belongsTo(Post, {
  foreignKey: {
    allowNull: false
  }
});

User.hasMany(Like, {
  foreignKey: {
    allowNull: false
  }
});
Like.belongsTo(User, {
  foreignKey: {
    allowNull: false
  }
});

module.exports = {
  sequelize,
  User,
  Follow,
  Post,
  Like
};