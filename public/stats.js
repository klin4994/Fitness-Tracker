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
  // Only get last 10 most recent workouts
  data.splice(10)
  data.forEach(workout => {
      const workoutTotal = workout.exercises.reduce((durationSum, { duration }) => {
        return durationSum + duration
      }, 0);
      durationSumArray.push(workoutTotal)
  },
  
  )
  const lastSevenDurationSum = durationSumArray.slice(durationSumArray.length-7).reduce((a,b) => a + b, 0)
  console.log(lastSevenDurationSum)
  let durations = durationSumArray;
  console.log(durationSumArray)
  let kg = calculateTotalWeight(data);
  let km = calculateTotalDistance(data);
  
  let workouts = workoutNames(data);
  const colors = generatePalette();

  let line = document.querySelector('#canvas').getContext('2d');
  let bar = document.querySelector('#canvas2').getContext('2d');
  let pie = document.querySelector('#canvas3').getContext('2d');

  const labels = data.map(({ day }) => {
    const date = new Date(day);
    return date.toLocaleDateString();
  });

  // Get 10 most recent workout from the 'data' retrieved
  let resistanceCount = 0, cardioCount = 0, recentWorkoutCount = 10;
  data.length < 10 ? recentWorkoutCount = data.length : null;

  // Loop for count incrementation for both workout types
  for(i=0; i<recentWorkoutCount ; i++) {
    if (data[i].exercises.length > 0) {
    $(data[i].exercises).each( (_,{type}) => {  
      if (type == "resistance") {
        resistanceCount++
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
          label: 'Duration',
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
        fontSize: 20
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Dates'
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Duration (minutes)'
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
        fontSize: 20
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              autoSkip: false,
              minRotation: 30,
              maxRotation: 30,
            },
            scaleLabel: {
              display: true,
              labelString: 'Distance (km)'
            },
          },
        ],
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Dates'
            },
          },
          
        ]
      },
    },
  });

  let pieChart = new Chart(pie, {
    type: 'pie',
    data: {
      labels: ["Resistance", "Cardio"],
      datasets: [
        {
          label: 'Exercises Performed',
          backgroundColor: ["#87CEFA","#DDA0DD"],
          data: [resistanceCount, cardioCount],
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Exercises as types from last 10 workouts:',
        fontSize: 20
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
