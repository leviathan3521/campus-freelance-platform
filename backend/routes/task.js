const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");


// ================= CREATE TASK (CLIENT ONLY) =================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can create tasks" });
    }

    const newTask = new Task({
      title,
      description,
      budget,
      postedBy: req.user.id
    });

    await newTask.save();

    res.json({ message: "Task created successfully", task: newTask });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= GET ALL TASKS =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("postedBy", "name email")
      .populate("assignedTo", "name email");

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= ASSIGN TASK (ONLY CLIENT WHO CREATED IT) =================
router.patch("/assign", authMiddleware, async (req, res) => {
  try {
    const { taskId, freelancerId } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can assign tasks" });
    }

    if (task.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You did not create this task" });
    }

    task.status = "assigned";
    task.assignedTo = freelancerId;

    await task.save();

    res.json({ message: "Task assigned successfully", task });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= COMPLETE TASK (ONLY ASSIGNED FREELANCER) =================
router.patch("/complete", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can complete tasks" });
    }

    if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not assigned to this task" });
    }

    task.status = "completed";

    await task.save();

    res.json({ message: "Task marked as completed", task });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;