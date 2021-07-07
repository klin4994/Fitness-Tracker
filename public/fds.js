// Render all resistance exercises
function resistanceExercisesRender(workoutSection, exercise) {
    // new row for resistance exercises
    const resistanceRow = document.createElement('div')
    // new col for resistance exercises
    const resistanceCol = document.createElement('div')
    $(resistanceCol).attr("class", "col-12")
      .appendTo(resistanceRow)
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
      
      $(resistanceCol).append(p)
      $(resistanceRow).append(resistanceCol)
        .appendTo(workoutSection)
    }
    });
  }