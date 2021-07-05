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

// get all workouts
app.get("/api/allworkouts", (req, res) => {
  // reverse _id, for descending date order
  dbs.find().sort({ _id: -1 })
    .then(dbWorkout => {
      res.json(dbWorkout.slice(1));
    })
    .catch(err => {
      res.json(err);
    });
})

// delete selected workouts
app.delete("/api/delete/:id", (req, res) => {
  dbs.findByIdAndDelete(req.params.id, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Deleted : ", docs);
    }
})
  .then(dbWorkout => {
    res.json(dbWorkout);
  })
  .catch(err => {
    res.json(err);
  });
})

// get workouts based on chosen filter criteria
app.get('/api/filter/:searchName', (req, res) => {
  console.log(req.params.searchName)
  dbs.find({$and:[
    // { 'exercises.type': { $regex : req.params.type } },
    { 'exercises.name': { $regex : req.params.searchName, '$options' : 'i' } },
    // { 'exercises.distance': {
    //   $gte: req.params.distanceDown, 
    //   $lt: req.params.distanceUp
    // } },
    // { 'exercises.duration': {
    //   $gte: req.params.durationDown, 
    //   $lt: req.params.durationUp
    // } },
    // { 'day': {
    //   $gte: req.params.dayDown, 
    //   $lt: req.params.dayUp
    // } },
  ]}).sort({ _id: -1  })
  .then(dbWorkout => {
    console.log(dbWorkout)
    res.json(dbWorkout)
  })    .catch(err => {
    res.json(err);
  });
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
