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
// app.get('/api/filter/:type/:searchName/:totalDurationDown/:totalDurationUp/:dateUp/:dateDown', (req, res) => {
app.get('/api/filter/:type/:searchName/:dateUp/:dateDown/:distanceUp/:distanceDown', (req, res) => {

  // console.log(req.params)
  // const typeQuery = { 'exercises.type': { $regex : req.params.type } }
  // const nameQuery = { 'exercises.name': { $regex : req.params.searchName, '$options' : 'i' } }
  // const totalDurationQuery = 
  //   { 'exercises.duration': {
  //     $gte: req.params.totalDurationDown, 
  //     $lte: req.params.totalDurationUp
  //   } }

  // // Date queries
  // const dateQuery = { 'day': {
  //     $gte: req.params.dayDown, 
  //     $lt: req.params.dayUp
  //   } }
  // const dateQueryUpOnly = { 'day': {
  //   $lt: req.params.dayUp
  // } }
  // const dateQueryDownOnly = { 'day': {
  //   $gte: req.params.dayDown, 
  // } }

  // // Distance queries
  // const distanceQuery = { 'exercises.distance': {
  //     $gte: req.params.distanceDown, 
  //     $lt: req.params.distanceUp
  //   } }
  // const distanceQueryUpOnly = { 'exercises.distance': {
  //   $lt: req.params.dayUp
  // } }
  // const distanceQueryDownOnly = { 'exercises.distance': {
  //   $gte: req.params.dayDown, 
  // } }


  // // Initiate query array
  // const queryArray =[];
  // // Push the relevant query to the array if any value has been provided
  // if (req.params.type){
  //   queryArray.push(typeQuery)
  // }
  // if (req.params.searchName){
  //   queryArray.push(nameQuery)
  // }
  
  // // If date range not provided
  // if (!req.params.dateUp && !req.params.dateDown) {
  //   return
  // // if both dates provided
  // } else if (req.params.dateUp && req.params.dateDown){
  //   queryArray.push(dateQuery)
  //   // if only upper date provided
  // } else if (!req.params.dateDown) {
  //   queryArray.push(dateQueryUpOnly)
  //   // if only lower date provided
  // } else if (!req.params.dateUp) {
  //   queryArray.push(dateQueryDownOnly)
  // }

  //   // If both distance values are not provided
  //   if (!req.params.totalDistanceUp && !req.params.totalDistanceDown) {
  //     return
  //   // if both distances provided
  //   } else if (req.params.totalDistanceUp && req.params.totalDistanceDown){
  //     queryArray.push(distanceQuery)
  //     // if only upper distance provided
  //   } else if (!req.params.totalDistanceDown) {
  //     queryArray.push(distanceQueryUpOnly)
  //     // if only lower distance provided
  //   } else if (!req.params.totalDistanceUp) {
  //     queryArray.push(distanceQueryDownOnly)
  //   }



  dbs.find({$and:[ 
    { 'exercises.type': { $regex : req.params.type, '$options' : 'i' } },
    { 'exercises.name': { $regex : req.params.searchName, '$options' : 'i' } },
    { 'day': {
      $gte: req.params.dateDown, 
      $lte: req.params.dateUp
    } },
    { 'exercises.distance': {
      $gte: req.params.distanceDown, 
      $lte: req.params.distanceUp
    } }
  ]
  //   [
  //   { 'exercises.type': { $regex : req.params.type } },
  //   what,
  //   { 'exercises.distance': {
  //     $gte: req.params.distanceDown, 
  //     $lt: req.params.distanceUp
  //   } },
  //   { 'exercises.duration': {
  //     $gte: req.params.totalDurationDown, 
  //     $lte: req.params.totalDurationUp
  //   } },
  //   { 'day': {
  //     $gte: req.params.dayDown, 
  //     $lt: req.params.dayUp
  //   } },
  // ]
}).sort({ _id: -1  })
  .then(dbWorkout => {
    console.log("aaa", dbWorkout)
    res.json(dbWorkout)
  })    .catch(err => {
    res.json(err);
  });
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
