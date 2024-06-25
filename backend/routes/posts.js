const express = require("express");
const { authRequired } = require("../middleware/auth");
const { Post } = require("../db");
const NotFoundError = require("../errors/notFound");
const BadRequestError = require("../errors/badRequest");
const ForbiddenError = require("../errors/forbidden");

const postsRouter = express.Router();

postsRouter.use(express.json());

postsRouter.post("/", authRequired, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      throw new BadRequestError("Missing content");
    }

    const post = await Post.create({
      OwnerUserId: req.user.id,
      content
    });

    return res.status(201).json(post);
  } catch (error) {
    return next(error);
  }
});

postsRouter.get("/", async (req, res, next) => {
  try {
    const { offset=0 } = req.query;
    const limit = 10;

    const postCount = await Post.count({});
    const posts = await Post.findAll({
      offset,
      limit
    });

    return res.json({
      postCount,
      posts
    });
  } catch(error) {
    return next(error);
  }
});

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return res.json(post);
  } catch (error) {
    return next(error);
  }
});

postsRouter.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new BadRequestError("Missing content");
    }

    const post = await Post.findByPk(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (req.user.id !== post.OwnerUserId) {
      throw new ForbiddenError("Not allowed");
    }

    post.set({
      content
    });

    await post.save();

    return res.json(post);
  } catch(error) {
    return next(error);
  }
});

postsRouter.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (req.user.id !== post.OwnerUserId) {
      throw new ForbiddenError("Not allowed");
    }

    await post.destroy();

    return res.sendStatus(204);
  } catch(error) {
    return next(error);
  }
});

module.exports = postsRouter;