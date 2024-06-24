const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Follow extends Model {};

  Follow.init({
    UserId: DataTypes.INTEGER,
    FollowedUserId: DataTypes.INTEGER
  }, {
    sequelize,
  });

  return Follow;
};