const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Post extends Model {};

  Post.init({
    OwnerUserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id"
      },
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
  });

  return Post;
};