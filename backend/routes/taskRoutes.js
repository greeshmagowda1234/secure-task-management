const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

/* VERIFY TOKEN (FIXED) */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Access denied");
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
}

/* ADD TASK */
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).send("Title is required");
    }

    const task = new Task({
      title,
      completed: false,
      userId: req.user.id
    });

    await task.save();
    res.json(task);

  } catch (err) {
    res.status(500).json(err);
  }
});

/* GET TASKS */
router.get("/", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* DELETE TASK */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid Task ID");
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).send("Task not found");
    }

    res.json({ message: "Task deleted" });

  } catch (err) {
    res.status(500).json(err);
  }
});

/* UPDATE TASK (FIXED) */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid Task ID");
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        completed: req.body.completed
      },
      {
        returnDocument: "after" 
      }
    );

    if (!task) {
      return res.status(404).send("Task not found");
    }

    res.json(task);

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
