const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { SECRET } = require("../utils/env");

const authRouter = express.Router();

authRouter.use(express.json());

authRouter.post("/", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const error = new Error("Missing field(s)");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      where: {
        username
      }
    });

    const credentialsError = new Error("Incorrect credentials");
    credentialsError.statusCode = 400;

    if (!user) {
      throw credentialsError;
    }

    const correctPassword = await bcrypt.compare(password, user.passwordHash);
    if (!correctPassword) {
      throw credentialsError;
    }

    const token = jwt.sign(user.toJSON(), SECRET);
    return res.json({ token });
  } catch(error) {
    return next(error);
  }
});

module.exports = authRouter;