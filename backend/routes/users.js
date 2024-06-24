const express = require("express");
const bcrypt = require("bcrypt");
const { authRequired } = require("../middleware/auth");
const { User, Follow } = require("../db");
const NotFoundError = require("../errors/notFound");
const BadRequestError = require("../errors/badRequest");
const ForbiddenError = require("../errors/forbidden");

const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/", async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      throw new BadRequestError("Missing field(s)");
    }

    const existingUser = await User.findOne({
      where: {
        username
      }
    });

    if (existingUser) {
      throw new BadRequestError("Username has already been taken");
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
      throw new NotFoundError("User not found");
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

usersRouter.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, name, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (req.user.id !== user.id) {
      throw new ForbiddenError("Not allowed");
    }

    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      user.set({
        passwordHash
      });
    }

    user.set({
      username: username || user.username,
      name: name || user.name
    });

    await user.save();

    return res.json(user);
  } catch(error) {
    return next(error);
  }
});

usersRouter.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (req.user.id !== user.id) {
      throw new ForbiddenError("Not allowed");
    }

    await user.destroy();

    return res.sendStatus(204);
  } catch(error) {
    return next(error);
  }
});

usersRouter.post("/:id/follow", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (req.user.id === user.id) {
      throw new ForbiddenError("Users cant follow themselves");
    }

    const existingFollow = await Follow.findOne({
      where: {
        UserId: req.user.id,
        FollowedUserId: user.id
      }
    });

    if (existingFollow) {
      throw new BadRequestError("Already following user");
    }

    await Follow.create({
      UserId: req.user.id,
      FollowedUserId: id
    });

    return res.sendStatus(204);
  } catch(error) {
    return next(error);
  }
});

usersRouter.delete("/:id/unfollow", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingFollow = await Follow.findOne({
      where: {
        UserId: req.user.id,
        FollowedUserId: user.id
      }
    });

    if (!existingFollow) {
      throw new NotFoundError("Not following the User");
    }

    await existingFollow.destroy();

    return res.sendStatus(204);
  } catch(error) {
    return next(error);
  }
});

module.exports = usersRouter;