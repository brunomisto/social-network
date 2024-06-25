const express = require("express");
const { authRequired } = require("../middleware/auth");
const { User, Follow } = require("../db");
const NotFoundError = require("../errors/notFound");
const BadRequestError = require("../errors/badRequest");
const ForbiddenError = require("../errors/forbidden");

const followsRouter = express.Router();

followsRouter.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const following = await Follow.findAll({
      where: {
        FollowerUserId: user.id
      }
    });

    const followers = await Follow.findAll({
      where: {
        FollowedUserId: user.id
      }
    });

    return res.json({
      following,
      followers
    });
  } catch(error) {
    return next(error);
  }
});

followsRouter.post("/:userId", authRequired, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (req.user.id === user.id) {
      throw new ForbiddenError("Users cant follow themselves");
    }

    const existingFollow = await Follow.findOne({
      where: {
        FollowerUserId: req.user.id,
        FollowedUserId: user.id
      }
    });

    if (existingFollow) {
      throw new BadRequestError("Already following user");
    }

    await Follow.create({
      FollowerUserId: req.user.id,
      FollowedUserId: user.id
    });

    return res.sendStatus(204);
  } catch(error) {
    return next(error);
  }
});

followsRouter.delete("/:userId", authRequired, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingFollow = await Follow.findOne({
      where: {
        FollowerUserId: req.user.id,
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

module.exports = followsRouter;