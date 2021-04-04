const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const resistanceSchema = new Schema({
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
    weight: {
      type: Number
    },
    reps: {
      type: Number
    },
    sets: {
      type: Number
    }
})
const workoutSchema = new Schema({
  day: {
    type: Date,
    default: Date.now
  },
  exercises: [resistanceSchema]
});

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;

