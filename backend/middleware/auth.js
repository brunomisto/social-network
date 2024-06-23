const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorized");
const { SECRET } = require("../utils/env");

const authRequired = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing token");
    }

    const token = authorization.replace(/^Bearer /, "");
    const authenticatedUser = jwt.verify(token, SECRET);

    req.user = authenticatedUser;

    return next();
  } catch(error) {
    return next(error);
  }
};

module.exports = { authRequired };