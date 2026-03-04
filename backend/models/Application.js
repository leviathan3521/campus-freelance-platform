const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  proposal: String,
  status: {
    type: String,
    default: "pending"
  }
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;