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
  useFindAndModify: false
});

// routes
app.use(require("./router/api.js"));

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
// continue last exercise
app.get(`/exercise?:id`, (req, res) => {
  console.log(req.query.id)
  dbs.findOne({_id: req.query.id})
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});
// create new workouts
app.put("/api/workouts/:id", ({body}, res) => {
  console.log(body)
  dbs.create(body)
  .then(({ _id }) => dbs.updateOne({_id:_id}, { $push: { exercises: body} }, { new: true }))
  .then(response => {
    res.json(response)
  }).catch(err => {
    res.json(err);
  });
})

// app.post("/submit", ({ body }, res) => {
//   db.Note.create(body)
//     .then(({ _id }) => db.User.findOneAndUpdate({}, { $push: { notes: _id } }, { new: true }))
//     .then(dbWorkout => {
//       res.json(dbWorkout);
//     })
//     .catch(err => {
//       res.json(err);
//     });
// });


app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
