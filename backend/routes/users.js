const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../db");

const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/", async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      const error = new Error("Missing field(s)");
      error.statusCode = 400;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      username,
      passwordHash
    });

    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = usersRouter;