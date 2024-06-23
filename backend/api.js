const express = require("express");
const usersRouter = require("./routes/users");

const apiRouter = express.Router();

apiRouter.use("/users", usersRouter);

apiRouter.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message;
  return res.status(statusCode).json({
    error: message
  });
});

module.exports = apiRouter;