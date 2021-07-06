$( document ).ready(function() {
  
  $("#filter").submit( async function(e) {
    loadFiltered(e)
  })

  // Function to load filtered results
  async  function loadFiltered(e) {
  e.preventDefault()
  const typeFilter = $("#exercise-type")[0].value;
  const nameFilter = $("#exercise-name")[0].value;
  const totalDurationHighFilter = $("#total-duration-high")[0].value;
  const totalDurationLowFilter = $("#total-duration-low")[0].value
  const dateHighFilter = $("#date-finish")[0].value;
  const dateLowFilter = $("#date-start")[0].value;
  const distanceHighFilter = $("#distance-finish")[0].value;
  const distanceLowFilter = $("#distance-start")[0].value
  console.log(distanceHighFilter)
  $( ".rest-workout-container" ).remove()
  console.log(dateHighFilter.toLocaleString('en-US', {
    weekday: 'short', // long, short, narrow
    day: 'numeric', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'long', // numeric, 2-digit, long, short, narrow
    hour: 'numeric', // numeric, 2-digit
    minute: 'numeric', // numeric, 2-digit
    second: 'numeric', // numeric, 2-digit
}));
  const filteredWorkouts = await API.getFilteredWorkouts(typeFilter,nameFilter,"", "", dateHighFilter, dateLowFilter,distanceHighFilter,distanceLowFilter)
  loadWorkouts(filteredWorkouts)
  // hide the modal after confirming
  $('#deleteModal').modal('hide')
}

// Modal for confirming of deletion of workouts
$('#confirm-delete').click(function(e) {
  var id = $(`#deleteModal`).attr('data-id');
  // if deleting from the filtered list (condition = input field not clear),
  // to be changed to filter toggle.
  if ($("#exercise-name")[0].value.length !==0) {
    API.deleteWorkout(id).then(loadFiltered(e))

  } else {
  // if from unfiltered list
  API.deleteWorkout(id).then( async function () {
  const restWorkouts = await API.getAllWorkouts()
  $( ".rest-workout-container" ).remove()
  loadWorkouts(restWorkouts)})
  $('#deleteModal').modal('hide');
  }
})

async function initWorkout() {
  const lastWorkout = await API.getLastWorkout();
  console.log("Last workout:", lastWorkout);
  let durationSum = 0;
  for (i=0; i<lastWorkout.exercises.length; i++) {
        durationSum = durationSum + lastWorkout.exercises[i].duration
  }
  // Render last workout
  if (lastWorkout) {
    document
      .querySelector("a[href='/exercise?']")
      .setAttribute("href", `/exercise.html?id=${lastWorkout._id}`);
    // small div to contain new id
    const newContainer = document.querySelector(".prev-workout-content")
    // add id to each smaller containers
    newContainer.setAttribute("id", "last"+lastWorkout._id)
    const workoutSummary = {
      date: formatDate(lastWorkout.day),
      totalDuration: durationSum,
      numExercises: lastWorkout.exercises.length,
      ...tallyExercises(lastWorkout.exercises)
    };

    renderLastWorkout(workoutSummary, "last"+lastWorkout._id, true);
  } else {
    renderNoWorkoutText()
  }
  const restWorkouts = await API.getAllWorkouts()
  loadWorkouts(restWorkouts)
}

// append all workout cards provided by the parameter
async function loadWorkouts(workouts) {
  const allWorkouts = await API.getAllWorkouts()
  if (workouts) {
    // loop throught the array except the first (latest date) workout in the array
    workouts.forEach(workout => {
    // get total workout duration by summing up the duration of all of its exercises
    let workoutTotalDuration=0;
    workout.exercises.forEach(exercise => {
      workoutTotalDuration += exercise.duration
    })
    document.querySelector("a[href='/exercise?']")
    // small div to contain new id
    const newContainer = document.createElement("div")
    // add id to each smaller containers
    newContainer.setAttribute("id", workout._id)
    const mainContainer = document.querySelector(".workouts-container")
    // append smaller containers to the main larger container
    mainContainer.appendChild(newContainer)
    const workoutSummary = {
      date: formatDate(workout.day),
      totalDuration: workoutTotalDuration,
      numExercises: workout.exercises.length,
      ...tallyExercises(workout.exercises)
    };

    renderRestWorkouts(workoutSummary, workout._id, false);
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
function renderLastWorkout(summary, id, lastWorkout) {
  const container = document.getElementById(`${id}`);
  // delete button
  const deleteButton = document.createElement('button')
  $(deleteButton)
    .attr("id", `del-${id}`)
    .attr("class", `delete-btn`)
    .text("Delete")
    .appendTo(container)
    .click(function() {
      API.deleteWorkout(this.id.slice(4)).then(()=>{
        // reload the cards for the rest of the workouts
        $( ".rest-workout-container" ).remove()
        initWorkout()})
    })
  // if not the last workout, apply class 'rest-workout-container' for styling
  !lastWorkout? container.setAttribute("class","rest-workout-container card raised "):container.setAttribute("class","prev-workout")
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

    p.appendChild(strong);
    p.appendChild(textNode);
    strong.setAttribute('class','card-header-last');
    container.appendChild(p);
  });
}

function renderRestWorkouts(summary, id, lastWorkout) {
  const container = document.getElementById(`${id}`);

  // create row for the card for grid arrangement
  const row = document.createElement('div')
  $(row).attr("class", "row g-0")
  // column to display workout data except date
  const workoutData = document.createElement('div')
  $(workoutData).attr("class", "col-md-6")

  // action column
  const actionSection = document.createElement('div')
  $(actionSection).attr("class", "col-md-3")
  // delete icon for the button
  const deleteIcon = document.createElement("i")
  $(deleteIcon).attr("class", "delete icon")
  // delete button
  const deleteButton = document.createElement('div')
  $(deleteButton)
    .attr("id", `del-${id}`)
    .attr("class", `small negative ui delete-btn`)
    .attr("data-bs-toggle", `modal`)
    .attr("data-bs-target", `#deleteModal`)
    .text("Delete ")
    .appendTo(actionSection)
    .append(deleteIcon)
    .click(function() {
      // get current id
      var id = $(this).attr("id").slice(4)
      // assign the data to the modal under 'data-id' attribute
      $('#deleteModal').attr('data-id', id).modal('show');
    })
  // if not the last workout, apply class 'rest-workout-container' for styling
  !lastWorkout? container.setAttribute("class","rest-workout-container card ui raised"):container.setAttribute("class","prev-workout")
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

    p.appendChild(textNode);
    if(key === 'date' && !lastWorkout){
      p.setAttribute('class','card-header text-center');
      strong.setAttribute('class','card-header1')
      $(row).append(
        `<div class="col-md-3 card-header">
        <span>${summary[key]}</span>
        </div>`
      );
    } else {
      $(workoutData).appendTo(row)
      $(actionSection).appendTo(row)
      $(workoutData).append(
        `<div class=" prev-workout-content">
          <span><strong>${workoutKeyMap[key]}</strong><span class="data">${summary[key]}</span></span>
        </div>`)
    }
  });

  $(container).append(row)
  
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
})
