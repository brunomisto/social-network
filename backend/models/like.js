const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Like extends Model {};

  Like.init({
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id"
      }
    },
    PostId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Posts",
        key: "id"
      }
    }
  }, {
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["UserId", "PostId"]
      }
    ]
  });

  return Like;
};