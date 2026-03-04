const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");


// ================= APPLY TO TASK (FREELANCER ONLY) =================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { taskId, proposal } = req.body;

    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can apply" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "open") {
      return res.status(400).json({ message: "Task is not open" });
    }

    const existingApplication = await Application.findOne({
      taskId,
      freelancerId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You already applied" });
    }

    const newApplication = new Application({
      taskId,
      freelancerId: req.user.id,
      proposal
    });

    await newApplication.save();

    res.json({ message: "Applied successfully", application: newApplication });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= GET APPLICATIONS FOR A TASK (CLIENT ONLY) =================
router.get("/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can view applications" });
    }

    if (task.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You did not create this task" });
    }

    const applications = await Application.find({ taskId })
      .populate("freelancerId", "name email");

    res.json(applications);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;