const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const BadRequestError = require("../errors/badRequest");
const { SECRET } = require("../utils/env");

const authRouter = express.Router();

authRouter.use(express.json());

authRouter.post("/", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequestError("Missing field(s)");
    }

    const user = await User.findOne({
      where: {
        username
      }
    });

    if (!user) {
      throw new BadRequestError("Incorrect credentials");
    }

    const correctPassword = await bcrypt.compare(password, user.passwordHash);
    if (!correctPassword) {
      throw new BadRequestError("Incorrect credentials");
    }

    const token = jwt.sign(
      user.toJSON(), 
      SECRET,
      { expiresIn: 24 * 60 * 60 }
    );

    return res.json({ token });
  } catch(error) {
    return next(error);
  }
});

module.exports = authRouter;