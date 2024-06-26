const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorized");
const { SECRET } = require("../utils/env");
const { User } = require("../db");

const authRequired = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing token");
    }

    const token = authorization.replace(/^Bearer /, "");
    const authenticatedUser = jwt.verify(token, SECRET);

    // Ensure user exists and is equal to the jwt
    const user = await User.findOne({
      where: {
        id: authenticatedUser.id,
        createdAt: authenticatedUser.createdAt,
      }
    });

    if (!user) {
      throw new UnauthorizedError("Invalid JWT");
    }

    req.user = user;

    return next();
  } catch(error) {
    return next(error);
  }
};

module.exports = { authRequired };