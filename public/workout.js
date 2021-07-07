$( document ).ready(function() {
  
  $("#filter").submit( async function(e) {
    loadFiltered(e)
  })

  // Function to load filtered results
  async  function loadFiltered(e) {
  e.preventDefault()
  const typeFilter = $("#exercise-type")[0].value || null;
  const nameFilter = $("#exercise-name")[0].value || null;
  // const totalDurationHighFilter = $("#total-duration-high")[0].value;
  // const totalDurationLowFilter = $("#total-duration-low")[0].value
  const dateHighFilter = $("#date-finish")[0].value || null;
  const dateLowFilter = $("#date-start")[0].value || null;
  const distanceHighFilter = $("#distance-finish")[0].value || null;
  const distanceLowFilter = $("#distance-start")[0].value || null;
  $( ".rest-workout-container" ).remove()
  const filteredWorkouts = await API.getFilteredWorkouts(
    typeFilter,nameFilter,"", "", dateHighFilter, dateLowFilter,distanceHighFilter,distanceLowFilter
    )
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

    renderRestWorkouts(workoutSummary, workout._id, false, workout.exercises);
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

function renderRestWorkouts(summary, id, lastWorkout,exercises) {
  console.log(exercises)
  const container = document.getElementById(`${id}`);

  // create row for the card for grid arrangement
  const row = document.createElement('div')
  $(row).attr("class", "row g-0")
  // column (middle) to display workout data except date
  const workoutSection = document.createElement('div')
  $(workoutSection).attr("class", "col-md-9")
  // Row inside the workoutSection for displaying workout information
  const workoutRow = document.createElement('div')
  $(workoutRow).attr("class", "row g-0")
    .appendTo(workoutSection)
  // Column to display workout data
  const workoutData = document.createElement('div')
  $(workoutData).attr("class", "col-10")
    .appendTo(workoutRow)
  // Column for actions, e.g delete button
  const workoutActions = document.createElement('div')
  $(workoutActions).attr("class", "col-2")
    .appendTo(workoutRow)
  // delete icon for the button
  const deleteIcon = document.createElement("i")
  $(deleteIcon).attr("class", "delete icon")
  // delete button
  const deleteButton = document.createElement('div')

  // Titles
  // Resistance Title
  const resistanceTitleRow = document.createElement('div')
  const resistanceTitleCol = document.createElement('div')
  $(resistanceTitleRow).attr({class:"row g-0", id:"resistanceTitleRow"})
    .appendTo(workoutSection)
    .text("resistance Title")
  $(resistanceTitleCol).attr({class:"col-12", id:"resistanceTitleCol"})
    .appendTo(resistanceTitleRow)
  // Count for resistance exercises, if ends up still as zero, remove the title
  let resistanceCount = 0;

  // Cardio Title
  const cardioTitleRow = document.createElement('div')
  const cardioTitleCol = document.createElement('div')
  $(cardioTitleRow).attr({class:"row g-0", id:"cardioTitleRow"})
    .appendTo(workoutSection)
    .text("Cardio Title")
  $(cardioTitleCol).attr({class:"col-12", id:"cardioTitleCol"})
    .appendTo(cardioTitleRow)
  // Count for cardio exercises, if ends up still as zero, remove the title
  let cardioCount = 0;

  // // Title row for resistance
  // const resistanceTitleRow = document.createElement('div')
  // $(resistanceTitleRow).attr("class", "row g-0")
  //   .appendTo(workoutSection)
  //   .text("Resistance exercises")
  // // new row for resistance exercises
  // const resistanceRow = document.createElement('div')
  // $(resistanceRow).attr("class", "row g-0")
  //   .appendTo(workoutSection)
  //   .text("Resistance exercises")

  // Render all resistance exercises if exist
  exercises.forEach(exercise => {
    if (exercise.type === "resistance") {
      resistanceExercisesRender(workoutSection, exercise)
    } else if (exercise.type === "resistance") {
      resistanceExercisesRender(resistanceTitleCol, exercise)
      resistanceCount ++
    } 
  })

  // Render all cardio exercises if exist
  exercises.forEach(exercise => {
    if (exercise.type === "resistance") {
      resistanceExercisesRender(workoutSection, exercise)
    } else if (exercise.type === "cardio") {
      cardioExercisesRender(cardioTitleCol, exercise)
      cardioCount ++
    } 
  })
  if(cardioCount === 0) {
    $("#cardioTitleRow").remove()
  }
  if(resistanceCount === 0) {
    $("#resistanceTitleRow").remove()
  }
  // if(Object.values(exercises[0]).indexOf("cardio")>1) {
  //   // cardioExercisesRender(workoutSection)
  //   console.log(exercises)
  //}
  

  
  // Delete button
  $(deleteButton)
    .attr("id", `del-${id}`)
    .attr("class", `small negative ui delete-btn`)
    .attr("data-bs-toggle", `modal`)
    .attr("data-bs-target", `#deleteModal`)
    .text("Delete ")
    .appendTo(workoutActions)
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
      $(workoutSection).appendTo(row)
      $(workoutData).append(
        `<div class=" prev-workout-content">
          <span><strong>${workoutKeyMap[key]}</strong><span class="data">${summary[key]}</span></span>
        </div>`)
    }
  });

  $(container).append(row)
  
}

// Render resistance exercises
// function renderResistance(exercise, resistanceRow) {
//   const resistanceRow = document.createElement('div')
//   $(row).attr("class", "row sg-0").text()
// }

 // Render all resistance exercises
 function resistanceExercisesRender(workoutSection, exercise) {

  // new row for resistance exercises
  const resistanceRow = document.createElement('div')
  $(resistanceRow).attr("class", "row g-0")
    .appendTo(workoutSection)
  }

 // Render all cardio exercises
function cardioExercisesRender(workoutSection, exercise) {
  // new row for cardio exercises
  const cardioRow = document.createElement('div')
  // new col for cardio exercises
  const cardioCol = document.createElement('div')
  $(cardioCol).attr("class", "col-12")
    .appendTo(cardioRow)
  Object.keys(exercise).forEach((stat, val) => {
    console.log(exercise[stat])
    if (stat !== "type") {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    
    strong.textContent = `${stat}: `;
    const textNode = document.createElement('span');
    textNode.textContent = exercise[stat]; 

    $(p).append(strong)
      .attr("class","prev-workout-content")
    ;
    $(p).append(textNode);
    textNode.setAttribute('class', 'data');
    
    $(cardioCol).append(p)
    $(cardioRow).append(cardioCol)
      .appendTo(workoutSection)
  }
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
})
