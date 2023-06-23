const express = require("express");
const db = require("./db");
const userRouter = express.Router();

userRouter.param("userId", async (req, res, next, userId) => {
  try {
    const user = await db.getOne("User", userId);
    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    res.sendStatus(404);
  }
});

userRouter.get("/:userId", (req, res, next) => {
  res.status(200).json({ user: req.user });
});

userRouter.get("/", async (req, res, next) => {
  try {
    const users = await db.allUser();
    res.json({ users: users });
  } catch (e) {
    console.log(e);
  }
});

module.exports = userRouter;
