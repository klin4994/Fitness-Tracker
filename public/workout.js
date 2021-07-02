async function initWorkout() {
  const lastWorkout = await API.getLastWorkout();
  console.log("Last workout:", lastWorkout);
  let durationSum = 0;
  for (i=0; i<lastWorkout.exercises.length; i++) {
        durationSum = durationSum + lastWorkout.exercises[i].duration
  }
  console.log(durationSum)

  // Render last workout
  if (lastWorkout) {
    document
      .querySelector("a[href='/exercise?']")
      .setAttribute("href", `/exercise.html?id=${lastWorkout._id}`);
    // small div to contain new id
    const newContainer = document.querySelector(".prev-workout-content")
    // add id to each smaller containers
    newContainer.setAttribute("id", lastWorkout._id)
    const workoutSummary = {
      date: formatDate(lastWorkout.day),
      totalDuration: durationSum,
      numExercises: lastWorkout.exercises.length,
      ...tallyExercises(lastWorkout.exercises)
    };

    renderWorkoutSummary(workoutSummary, lastWorkout._id,true);
  } else {
    renderNoWorkoutText()
  }
  // Get all past workouts
  
  const allWorkouts = await API.getAllWorkouts()
  // remove last workout
  allWorkouts.pop()
  console.log("All workouts", allWorkouts)
  if (allWorkouts) {
    allWorkouts.forEach(workout => {
    document.querySelector("a[href='/exercise?']")
    // small div to contain new id
    const newContainer = document.createElement("div")
    // add id to each smaller containers
    newContainer.setAttribute("id", workout._id)
    const mainContainer = document.querySelector(".container")
    // append smaller containers to the main larger container
    mainContainer.appendChild(newContainer)
    const workoutSummary = {
      date: formatDate(workout.day),
      totalDuration: durationSum,
      numExercises: workout.exercises.length,
      ...tallyExercises(workout.exercises)
    };

    renderWorkoutSummary(workoutSummary, workout._id);
  })
  } else {
    renderNoWorkoutText()
  }
  
}

function tallyExercises(exercises) {
  const tallied = exercises.reduce((acc, curr) => {
    if (curr.type === "resistance") {
      acc.totalWeight = (acc.totalWeight || 0) + curr.weight;
      acc.totalSets = (acc.totalSets || 0) + curr.sets;
      acc.totalReps = (acc.totalReps || 0) + curr.reps;
    } else if (curr.type === "cardio") {
      acc.totalDistance = (acc.totalDistance || 0) + curr.distance;
    }
    return acc;
  }, {});
  return tallied;
}

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  return new Date(date).toLocaleDateString(options);
}

function renderWorkoutSummary(summary, id, lastWorkout) {
  const container = document.getElementById(`${id}`);
  // if not the last workout, apply class 'rest-workout-container' for styling
  !lastWorkout? container.setAttribute("class","rest-workout-container card border-danger "):container.setAttribute("class","prev-workout")
  const workoutKeyMap = {
    date: "Date",
    totalDuration: "Workout Duration (min) ",
    numExercises: "Exercises Performed",
    totalWeight: "Weight Lifted (kg)",
    totalSets: "Sets Performed",
    totalReps: "Reps Performed",
    totalDistance: "Distance Covered (kg)"
  };

  Object.keys(summary).forEach(key => {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    
    strong.textContent = workoutKeyMap[key];
    const textNode = document.createTextNode(`: ${summary[key]}`);

    p.appendChild(strong);
    p.appendChild(textNode);
    if(key==='date'){p.setAttribute('class','card-header');strong.setAttribute('class','card-header1')};
    container.appendChild(p);
  });
}

function renderNoWorkoutText() {
  const container = document.querySelector(".workout-stats");
  const p = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = "You have not created a workout yet!"

  p.appendChild(strong);
  container.appendChild(p);
}

initWorkout();
