const express = require("express");
const mongoose = require("mongoose");
const dbs = require("./models/Workout.js");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workoutdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// routes
app.use(express.Router());

// get all workouts
app.get("/api/workouts/range", (req, res) => {
  dbs.find({})
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

// get last workout
app.get("/api/workouts", (req, res) => {
  dbs.find({})
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});
// add exercise
app.put("/api/workouts/:id", (req, res) => {
  
  dbs.updateOne({_id:req.params.id}, { $push: { exercises: req.body} }, { new: true })
  .then(response => {
    res.json(response)
  }).catch(err => {
    res.json(err);
  });
  dbs.aggregate ([{$group:{totalDuration:{$sum:"$duration"}, count: { $sum: 1 }}}]).then(response => {
    res.json(response)
  }).catch(err => {
    res.json(err);
  });
})
// create new workouts
app.post("/api/workouts", ({body}, res) => {
  console.log("post req", body)
  dbs.create(body)
  .then(response => {
    res.json(response)
  }).catch(err => {
    res.json(err);
  });
})



app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
