$( document ).ready(function() {
  API.deleteWorkout()
  // Delete empty workouts (no exercises)
  API.deleteWorkout()
  $("#filter").submit( async function(e) {
    const typeFilter = $("#exercise-type")[0].value;
    const nameFilter = $("#exercise-name")[0].value;
    // const totalDurationHighFilter = $("#total-duration-high")[0].value;
    // const totalDurationLowFilter = $("#total-duration-low")[0].value
    const dateHighFilter = $("#date-finish")[0].value;
    const dateLowFilter = $("#date-start")[0].value;
    const distanceHighFilter = $("#distance-finish")[0].value;
    const distanceLowFilter = $("#distance-start")[0].value;
    // if any of the filter value is not empty/other than the default value, make 'filterOn' variable 'true'
    if (typeFilter == 'all' &&
      !nameFilter &&
      !dateHighFilter &&
      !dateLowFilter &&
      !distanceHighFilter &&
      !distanceLowFilter) {
        API.deleteWorkout(id).then( async function () {
          const restWorkouts = await API.getAllWorkouts()
          $( ".rest-workout-container" ).remove()
          loadWorkouts(restWorkouts)
        })
      } else {
        loadFiltered(e)
      }
    
  })
  
  // Function to load filtered results
  async  function loadFiltered(e) {
    e.preventDefault()
    // hide last workout card
    $('#previous-workout-card').hide()
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
$('#confirm-delete').click( e => {
  
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
    loadWorkouts(restWorkouts)
  })
  $('#deleteModal').modal('hide');
  }
})

async function initWorkout() {
  const lastWorkout = await API.getLastWorkout();
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

  
    renderWorkouts(workoutSummary, "last"+lastWorkout._id, true, lastWorkout.exercises);
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
    const mainContainer = document.querySelector("#workouts-container")
    // append smaller containers to the main larger container
    mainContainer.appendChild(newContainer)
    const workoutSummary = {
      date: formatDate(workout.day),
      numExercises: workout.exercises.length,
      totalDuration: workoutTotalDuration,
      ...tallyExercises(workout.exercises)
    };

    renderWorkouts(workoutSummary, workout._id, false, workout.exercises);
  })
  } else {
    renderNoWorkoutText()
  }

}

function tallyExercises(exercises) {
  const tallied = exercises.reduce((acc, curr) => {
    if (curr.type === "resistance") {
      acc.totalWeight = (acc.totalWeight || 0) + curr.weight;
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
// function renderLastWorkout(summary, id, lastWorkout) {
//   const container = document.getElementById(`${id}`);
//   // if not the last workout, apply class 'rest-workout-container' for styling
//   !lastWorkout? container.setAttribute("class","rest-workout-container card raised "):container.setAttribute("class","prev-workout")
//   const workoutKeyMap = {
//     date: "",
//     totalDuration: "Duration (min): ",
//     numExercises: "Exercises:",
//     totalWeight: "Weight (kg):",
//     totalSets: "Sets: ",
//     totalReps: "Reps: ",
//     totalDistance: "Distance (km):"
//   };
//   Object.keys(summary).forEach(key => {
//     const p = document.createElement("p");
//     const span = document.createElement("span");
    
//     span.textContent = workoutKeyMap[key];
//     // workout data (e.g 50 mins, 12 reps...)
//     const textNode = document.createElement('span');
//     textNode.textContent = `${summary[key]}`; 

//     p.appendChild(span);
//     p.appendChild(textNode);
//     span.setAttribute('class','card-header-last');
//     container.appendChild(p);
//   });
// }

function renderWorkouts(summary, id, lastWorkout,exercises) {

  const container = document.getElementById(`${id}`);

  // create row for the card for grid arrangement
  const row = document.createElement('div')

  // column to display workout data except date
  const workoutSection = document.createElement('div')
  $(workoutSection).attr("class", "col-md-12")

  // Row inside the workoutSection for displaying workout information
  const workoutRow = document.createElement('div')
  $(workoutRow).attr("class", "row g-0")
    .appendTo(workoutSection)
  // Jumbotron at the top to show 'Workout Summary' as card title
  const summaryJumbotronCol = document.createElement('div')
  $(summaryJumbotronCol).attr("class", "col-12")
    .appendTo(workoutRow)

    const summaryJumbotron = document.createElement('div')
  $(summaryJumbotron).attr({class:"jumbotron shadow-sm workoutJumbotron summaryTitleText"})
    .appendTo(summaryJumbotronCol)
    .text('Workout Summary')
    
  // Column to display workout data
  const workoutData = document.createElement('div')
  $(workoutData).attr("class", "col-12")
    .appendTo(workoutRow)

  // Row inside the workout data
  const workoutDataRow = document.createElement('div');
  $(workoutDataRow).attr("class", "row g-0 bulk-stat-row")
    .appendTo(workoutData);
  // delete icon for the button
  const deleteIcon = document.createElement("i")
  $(deleteIcon).attr("class", "delete icon")
  // delete button
  const deleteButton = document.createElement('button')

  // Titles
  // Resistance Title
  const resistanceTitleRow = document.createElement('div')
  const resistanceTitleCol = document.createElement('div')
  const resistanceTitleText = document.createElement('div')
  // if there at least one resistance exercise, render the title jumbtro
  exercises.forEach(exercise => {
    if (exercise.type==="resistance") {
    
      $(resistanceTitleRow).attr({class:"row g-0", id:"resistanceTitleRow"})
        .appendTo(workoutSection)
      $(resistanceTitleCol).attr({class:"col-12", id:"resistanceTitleCol"})
        .appendTo(resistanceTitleRow)
      
      $(resistanceTitleText).attr({class:"jumbotron shadow-sm workoutJumbotron resistanceTitleText"})
      .appendTo(resistanceTitleCol)
      .text("Resistance")
    }
  })

  // Cardio Title
  const cardioTitleRow = document.createElement('div')
  const cardioTitleCol = document.createElement('div')
  const cardioTitleText = document.createElement('div')
  // if there at least one cardio exercise, render the title jumbtro
  exercises.forEach(exercise => {
    if (exercise.type==="cardio") {
    
      $(cardioTitleRow).attr({class:"row g-0", id:"cardioTitleRow"})
        .appendTo(workoutSection)
        
        
      $(cardioTitleCol).attr({class:"col-12", id:"cardioTitleCol"})
        .appendTo(cardioTitleRow)
      
      $(cardioTitleText).attr({class:"jumbotron shadow-sm workoutJumbotron cardioTitleText"})
      .appendTo(cardioTitleCol)
      .text("Cardio")
    }
  })

  // Render all cardio exercises if exist
  exercises.forEach(exercise => {
    if (exercise.type === "resistance") {
      resistanceExercisesRender(resistanceTitleCol, exercise)
    } else if (exercise.type === "cardio") {
      cardioExercisesRender(cardioTitleCol, exercise)
    } 
  })
  
  // Delete button
  $(deleteButton)
    .attr("id", `del-${id}`)
    // .attr("class", `small negative ui delete-btn`)
    .attr("data-bs-toggle", `modal`)
    .attr("data-bs-target", `#deleteModal`)
    .attr("class","fa fa-trash-o delete-btn")
    .click(function() {
      // get current id
      var id = $(this).attr("id").slice(4)
      // assign the data to the modal under 'data-id' attribute
      $('#deleteModal').attr('data-id', id).modal('show');
      const body = document.getElementsByTagName('body')
      // $(body).attr('style', 'overflow:hidden ; padding-right:0')
    })
  
  // Formatting workout cards based on whether it's the latest workout or not (remainder)
  if (lastWorkout) {
    // Remove shadows for the internal card
    $(container).attr("class","last-workout-container card ui shadow-none raised ")
  } else {
    $(deleteButton).appendTo(row)
      .attr("class","fa fa-trash-o delete-btn")
      .click(function() {
        // get current id
        var id = $(this).attr("id").slice(4)
        // assign the data to the modal under 'data-id' attribute
        $('#deleteModal').attr('data-id', id).modal('show');
      })
      $(container).attr("class","rest-workout-container card ui raised ")
  }
  const workoutKeyMap = {
    date: "", 
    numExercises: "Exercises:",
    totalWeight: "Weight (kg):",
    totalSets: "Sets: ",
    totalReps: "Reps: ",
    totalDistance: "Distance (km):",
    totalDuration: "Duration (min): ",
  };
  console.log(summary)
  Object.keys(summary).forEach(key => {
    const p = document.createElement("span");

    const span = document.createElement("span");
    
    span.textContent = workoutKeyMap[key];
    // workout data (e.g 50 mins, 12 reps...)
    const textNode = document.createElement('span');
    textNode.textContent = `${summary[key]}`;
    if (key != 'date'){
      textNode.setAttribute('class', 'workout-data');
    }

    p.appendChild(textNode);
    if(key === 'date'){
      p.setAttribute('class','card-header text-center');
      span.setAttribute('class','card-header1')
      $(row).append(
        `<div class=" card-header">
        <span>${summary[key]}</span>
        </div>`
      );
    } else {
      $(workoutSection).appendTo(row)
      $(workoutDataRow).append(
        `<div class=" col-sm-6 workout-summary-text prev-workout-content ">
          <span>
            <span>${workoutKeyMap[key]}</span>
            <span class="data">${summary[key]}</span>
          </span>
        </div>`)
    }
  });

  $(container).append(row)
  
}

 // Render all cardio exercises
function cardioExercisesRender(workoutSection, exercise) {

  // new row for cardio exercises
  const cardioRow = document.createElement('div')
  $(cardioRow).attr("class", "row g-0 bulk-stat-row")
  // new col for cardio exercises
  const cardioCol = document.createElement('div')
  $(cardioCol).attr("class", "col-12")
    .appendTo(cardioRow)

  // Data row
  const dataRow = document.createElement('div')
  $(dataRow).attr("class", "row g-0")
    .appendTo(cardioCol)
  const hr = document.createElement("hr");
  $(dataRow).append(hr);
  Object.keys(exercise).forEach((stat, val) => {
    let dataCol = document.createElement('div')
    // the 'name' property takes the whole row width (12 cols), in case there's a lot of characters for 6 col-width
    if (stat==="name") {
      $(dataCol).attr("class", "col-12 exercise-name-col")
    } else {
      // the rest of data will take 6 col width
      $(dataCol).attr("class", "col-sm-6")
    }
    
    if (stat !== "type") {
    const p = document.createElement("p");
    const span = document.createElement("span");


    const capitalized = stat.charAt(0).toUpperCase();
    const rest = stat.slice(1)

    // add units where appropriate
    switch (stat) {
      case "distance":
        span.textContent = capitalized + rest + " (km):"
        break;
      case "duration":
        span.textContent = capitalized + rest + " (min):"
        break;
        default:
        span.textContent = capitalized + rest
    }
    const textNode = document.createElement('span');
    textNode.textContent = exercise[stat]; 
    $(span).attr("class", "capitalize")
    $(p).append(span)
      .attr("class","prev-workout-content exercise-summary-text")
      .append(textNode);
    textNode.setAttribute('class', 'data');
    $(dataCol).append(p).appendTo(dataRow)
    $(cardioRow).append(cardioCol)
      .appendTo(workoutSection)
  }
  });
}

 // Render all resistance exercises
 function resistanceExercisesRender(workoutSection, exercise) {
  // new row for resistance exercises
  const resistanceRow = document.createElement('div')
  $(resistanceRow).attr("class", "row g-0 bulk-stat-row")
  // new col for resistance exercises
  const resistanceCol = document.createElement('div')
  $(resistanceCol).attr("class", "col-12")
    .appendTo(resistanceRow)

  // Data row
  const dataRow = document.createElement('div')
  $(dataRow).attr("class", "row g-0")
    .appendTo(resistanceCol)

  const hr = document.createElement("hr");
  $(dataRow).append(hr);
  Object.keys(exercise).forEach((stat, val) => {
    let dataCol = document.createElement('div')
    // the 'name' property takes the whole row width (12 cols), in case there's a lot of characters for 6 col-width
    if (stat==="name") {
      $(dataCol).attr("class", "col-12 exercise-name-col")
    } else {
      // the rest of data will take 6 col width
      $(dataCol).attr("class", "col-sm-6")
    }
    
    if (stat !== "type") {
    const p = document.createElement("p");
    const span = document.createElement("span");
    
    const capitalized = stat.charAt(0).toUpperCase();
    const rest = stat.slice(1)

    // add units where appropriate
    switch (stat) {
      case "weight":
        span.textContent = capitalized + rest + " (kg):"
        break;
      case "duration":
        span.textContent = capitalized + rest + " (min):"
        break;
        default:
        span.textContent = capitalized + rest + ":"
    }

    const textNode = document.createElement('span');
    textNode.textContent = exercise[stat]; 

    $(span).attr("class", "capitalize")
    $(p).append(span)
      .attr("class","prev-workout-content exercise-summary-text ")
      .append(textNode);
    textNode.setAttribute('class', 'data');
    $(dataCol).append(p).appendTo(dataRow)
    $(resistanceRow).append(resistanceCol)
      .appendTo(workoutSection)
  }
  });
}

function renderNoWorkoutText() {
  const container = document.querySelector(".workout-stats");
  const p = document.createElement("p");
  const span = document.createElement("span");
  
  span.textContent = "You have not created a workout yet!"

  p.appendChild(span);
  container.appendChild(p);
  
}


initWorkout();
})
