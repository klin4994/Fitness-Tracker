function generatePalette() {
  const arr = [
    '#003f5c',
    '#2f4b7c',
    '#665191',
    '#a05195',
    '#d45087',
    '#f95d6a',
    '#ff7c43',
    'ffa600',
    '#003f5c',
    '#2f4b7c',
    '#665191',
    '#a05195',
    '#d45087',
    '#f95d6a',
    '#ff7c43',
    'ffa600',
  ];

  return arr;
}

function populateChart(data) {
  let durationSumArray = [];
  data.forEach(workout => {
    // for (i=0; i<workout.exercises.length; i++) {
    //   durationSum = durationSum + workout.exercises[i].duration
    //   thisId = workout._id;
    //   console.log(thisId, durationSum)
    //   durationSumArray.push(durationSum)
    // }
      const workoutTotal = workout.exercises.reduce((durationSum, { duration }) => {
        return durationSum + duration
      }, 0);
      durationSumArray.push(workoutTotal)
  },
  
  )
  const lastSevenDurationSum = durationSumArray.slice(durationSumArray.length-7).reduce((a,b) => a + b, 0)
  console.log(lastSevenDurationSum)
  document.querySelector('#lastSevenDSum').innerHTML=lastSevenDurationSum;
  let durations = durationSumArray;
  console.log(durationSumArray)
  let kg = calculateTotalWeight(data);
  let km = calculateTotalDistance(data);
  const lastSevenWeightsSum = kg.slice(kg.length-7).reduce((a,b) => a + b, 0)
  document.querySelector('#lastSevenSSum').innerHTML=lastSevenWeightsSum;
  let workouts = workoutNames(data);
  const colors = generatePalette();

  let line = document.querySelector('#canvas').getContext('2d');
  let bar = document.querySelector('#canvas2').getContext('2d');
  let pie = document.querySelector('#canvas3').getContext('2d');
  let pie2 = document.querySelector('#canvas4').getContext('2d');

  console.log(data)
  const labels = data.map(({ day }) => {
    const date = new Date(day);
    return date.toLocaleDateString();
  });

  // Get 10 most recent workout from the 'data' retrieved
  let resistanceCount = 0, cardioCount = 0, recentWorkoutCount = 10;
  data.length < 10 ? recentWorkoutCount = data.length : null;

  // 
  for(i=0; i<recentWorkoutCount ; i++) {
    if (data[i].exercises.length > 0) {
      console.log(data[i].exercises.length)
    $(data[i].exercises).each( (_,{type}) => {  
      if (type == "resistance") {
        console.log(resistanceCount)
      } else if (type == "cardio" ) {
        cardioCount++
      }
     })
    }
  }
  let lineChart = new Chart(line, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Duration (min)',
          backgroundColor: '#f2711c',
          borderColor: '#f2711c',
          data: durations,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Duration Per Workout',
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
            },
          },
        ],
      },
    },
  });

  let barChart = new Chart(bar, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Distance (km)',
          data: km,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Daily Distance Ran',
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });

  console.log(workouts)
  let pieChart = new Chart(pie, {
    type: 'pie',
    data: {
      labels: workouts,
      datasets: [
        {
          label: 'Exercises Performed',
          backgroundColor: colors,
          data: durations,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Exercises Performed',
      },
    },
  });

  let donutChart = new Chart(pie2, {
    type: 'doughnut',
    data: {
      labels: workouts,
      datasets: [
        {
          label: 'Exercises Performed',
          backgroundColor: colors,
          data: kg,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Exercises Performed',
      },
    },
  });
}

function calculateTotalDistance(data) {
  let totals = [];
  
  // If cardio exercise, get running distance
  data.forEach((workout) => {
      const workoutTotal = workout.exercises.reduce((total, {type, distance} ) => {
        if (type  === "cardio") {
          return total + distance;
        }          
      }, 0);
      totals.push(workoutTotal);
  });
  
  return totals;
}

function calculateTotalWeight(data) {
  let totals = [];

  data.forEach((workout) => {
    const workoutTotal = workout.exercises.reduce((total, { type, weight }) => {
      if (type === 'resistance') {
        return total + weight;
      } else {
        return total;
      }
    }, 0);

    totals.push(workoutTotal);
  });
  
  return totals;
}

function workoutNames(data) {
  let workouts = [];

  data.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      workouts.push(exercise.name);
    });
  });

  // return de-duplicated array with JavaScript `Set` object
  return [...new Set(workouts)];
}

// get all workout data from back-end
API.getWorkoutsInRange().then(populateChart);
