const express = require("express");
const { authRequired } = require("../middleware/auth");
const { Post, Like } = require("../db");
const NotFoundError = require("../errors/notFound");
const BadRequestError = require("../errors/badRequest");

const likesRouter = express.Router();

likesRouter.get("/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const likes = await Like.findAll({
      where: {
        PostId: post.id
      }
    });

    return res.json(likes);
  } catch(error) {
    return next(error);
  }
});

likesRouter.post("/:postId", authRequired, async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const existingLike = await Like.findOne({
      where: {
        UserId: req.user.id,
        PostId: post.id
      }
    });

    if (existingLike) {
      throw new BadRequestError("Already liked Post");
    }

    await Like.create({
      UserId: req.user.id,
      PostId: post.id
    });

    return res.sendStatus(204);
  } catch(error) {
    return next(error);
  }
});

likesRouter.delete("/:postId", authRequired, async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const existingLike = await Like.findOne({
      where: {
        UserId: req.user.id,
        PostId: post.id
      }
    });

    if (!existingLike) {
      throw new BadRequestError("Post not liked yet");
    }

    await existingLike.destroy();

    return res.sendStatus(204);
  } catch(error) {
    return next(error);
  }
});

module.exports = likesRouter;