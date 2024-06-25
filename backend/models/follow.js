const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Follow extends Model {};

  Follow.init({
    FollowerUserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id"
      }
    },
    FollowedUserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id"
      }
    }
  }, {
    sequelize,
  });

  return Follow;
};