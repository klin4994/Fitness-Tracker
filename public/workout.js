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

    renderLastWorkoutSummary(workoutSummary, lastWorkout._id,true);
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

  return new Date(date).toLocaleDateString(undefined, options);
}

// Last workout summary
function renderLastWorkoutSummary(summary, id, lastWorkout) {
  const container = document.getElementById(`${id}`);
  // if not the last workout, apply class 'rest-workout-container' for styling
  !lastWorkout? container.setAttribute("class","rest-workout-container card border-danger "):container.setAttribute("class","prev-workout")
  const workoutKeyMap = {
    date: "",
    totalDuration: "Duration (min): ",
    numExercises: "Exercises:",
    totalWeight: "Weight (kg):",
    totalSets: "Sets: ",
    totalReps: "Reps: ",
    totalDistance: "Distance (km):"
  };
  Object.keys(summary).forEach(key => {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    
    strong.textContent = workoutKeyMap[key];
    // workout data (e.g 50 mins, 12 reps...)
    const textNode = document.createElement('span');
    textNode.textContent = `${summary[key]}`;
    // if (key != 'date'){
    //   textNode.setAttribute('class', 'workout-data');
    // }
    

    p.appendChild(strong);
    p.appendChild(textNode);
    strong.setAttribute('class','card-header-last');
    container.appendChild(p);
  });
}

function renderWorkoutSummary(summary, id, lastWorkout) {
  const container = document.getElementById(`${id}`);
  // if not the last workout, apply class 'rest-workout-container' for styling
  !lastWorkout? container.setAttribute("class","rest-workout-container card  "):container.setAttribute("class","prev-workout")
  const workoutKeyMap = {
    date: "",
    totalDuration: "Duration (min): ",
    numExercises: "Exercises:",
    totalWeight: "Weight (kg):",
    totalSets: "Sets: ",
    totalReps: "Reps: ",
    totalDistance: "Distance (km):"
  };
  Object.keys(summary).forEach(key => {
    const p = document.createElement("span");
    const strong = document.createElement("strong");
    
    strong.textContent = workoutKeyMap[key];
    // workout data (e.g 50 mins, 12 reps...)
    const textNode = document.createElement('span');
    textNode.textContent = `${summary[key]}`;
    if (key != 'date'){
      textNode.setAttribute('class', 'workout-data');
    }

    p.appendChild(strong);
    p.appendChild(textNode);
    if(key==='date'&& !lastWorkout){p.setAttribute('class','card-header text-center');strong.setAttribute('class','card-header1')};
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
