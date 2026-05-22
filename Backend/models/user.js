const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: String,
  phone: Number,
  dob: Date,
  gender: String,
  email: { type: String, unique: true },
  password: String,
  street: String,
  city: String,
  state: String,
  country: String,
  role: String,
  resumeUrl: String,
  skills: [String],
  appliedJobs: [
    {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
