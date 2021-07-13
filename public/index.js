init();

async function init() {
  // Button to clear all filters
  $("#clear-all-filters").click((e) => {
    e.preventDefault();
    $("input").val('')
  })
  // Distance slider
  $("#slider").slider({
    min: 0,
    max: 100,
    step: 1,
    values: [30, 70],
    slide: function(event, ui) {
        for (var i = 0; i < ui.values.length; ++i) {
            $("input.sliderValue[data-index=" + i + "]").val(ui.values[i]);
        }
    }
});

$("input.sliderValue").change(function() {
    var $this = $(this);
    $("#slider").slider("values", $this.data("index"), $this.val());
});

  // Assign new Id to new workout
  if (location.search.split("=")[1] === undefined) {
    const workout = await API.getLastWorkout();
    if (workout) {
      location.search = "?id=" + workout._id;
    } else {
      document.querySelector("#continue-btn").classList.add("d-none")
    }
  }
}

