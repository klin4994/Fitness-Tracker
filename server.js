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

// Get last 20 workouts
  app.get("/api/last-20-workouts", (req, res) => {
    dbs.find().sort({ _id: -1 }).limit(10)
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
app.get('/api/filter/:type/:searchName/:dateUp/:dateDown/:distanceUp/:distanceDown', ({params}, res) => {
  const typeQuery = { 'exercises.type': { $regex : params.type } }
  const nameQuery = { 'exercises.name': { $regex : params.searchName, '$options' : 'i' } }
  // const totalDurationQuery = 
  //   { 'exercises.duration': {
  //     $gte: params.totalDurationDown, 
  //     $lte: params.totalDurationUp
  //   } }

  // Date queries
  const dateQuery = { 'day': {
      $gte: params.dateDown, 
      $lt: params.dateUp
    } }
  const dateQueryUpOnly = { 'day': {
    $lt: params.dateUp
  } }
  const dateQueryDownOnly = { 'day': {
    $gte: params.dateDown, 
  } }

  // Distance queries
  const distanceQuery = { 'exercises.distance': {
      $gte: params.distanceDown, 
      $lt: params.distanceUp
    } }
  const distanceQueryUpOnly = { 'exercises.distance': {
    $lt: params.distanceUp
  } }
  const distanceQueryDownOnly = { 'exercises.distance': {
    $gte: params.distanceDown, 
  } }


  // // Initiate query array
  const queryArray =[];

  // Push the relevant query to the array if any value has been provided
  if (params.type !== "all"){
    queryArray.push(typeQuery)
  }
  if (params.searchName !== "null"){
    queryArray.push(nameQuery)
  }
  
  // If date range not provided
  if (params.dateUp == "null" && params.dateDown == "null") {
    console.log("no dates to both")
  // if both dates provided
  } else if (params.dateUp !== "null" && params.dateDown !== "null"){
    queryArray.push(dateQuery)
    // if only upper date provided
  } else if (params.dateDown == "null") {
    queryArray.push(dateQueryUpOnly)
    // if only lower date provided
  } else if (!params.dateUp == "null")  {
    queryArray.push(dateQueryDownOnly)
  }

  // If both distance values are not provided
  if (params.distanceUp == "null" && params.distanceDown == "null") {
    return
  // if both distances provided
  } else if (params.distanceUp !== "null" && params.distanceDown !== "null"){
    queryArray.push(distanceQuery)
    // if only upper distance provided
  } else if (params.distanceDown == "null") {
    queryArray.push(distanceQueryUpOnly)
    // if only lower distance provided
  } else if (params.distanceUp == "null") {
    queryArray.push(distanceQueryDownOnly)
  }

  // Compile all queries prior making request to the db
  console.log("yo",queryArray)


  dbs.find({
    $and:queryArray
  }).sort({ _id: -1  })
  .then(dbWorkout => {
    console.log("aaa", dbWorkout)
    res.json(dbWorkout)
  })    
  .catch(err => {
    res.json(err);
  });
})

// Delete workouts with no exercises
app.delete ("/api/delete-empty", (req, res) => {
    dbs.deleteMany({ exercises: []})
    .then (dbWorkout => {
      res.json(dbWorkout)
    })
    .catch (err => {
      res.json(err)
    })
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
