const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const cardioSchema = new Schema({
    type: {
      type: String,
      trim: true,
     },
    name: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number
    },
    distance: {
      type: Number
    }
})
const workoutSchema = new Schema({
  day: {
    type: Date,
    default: Date.now
  },
  exercises: [cardioSchema]
});

const Cardio = mongoose.model("cardio", workoutSchema);

module.exports = Cardio;

