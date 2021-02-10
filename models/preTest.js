const mongoose = require("mongoose");

const pretestQuestionsSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const pretestShema = new mongoose.Schema(
  {
    questions: [pretestQuestionsSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    score:{
      type: Number,
      default:0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PreTest", pretestShema);
