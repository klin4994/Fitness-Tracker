
const API = {
  async getLastWorkout() {
    let res;
    try {
      res = await fetch("/api/workouts");
    } catch (err) {
      console.log(err)
    }
    const json = await res.json();

    return json[json.length - 1];
  },
  async addExercise(data) { 
    const id = location.search.split("=")[1];

    const res = await fetch("/api/workouts/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const json = await res.json();

    return json;
  },
  async createWorkout(data = {}) {
    const res = await fetch("/api/workouts", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });

    const json = await res.json();

    return json;
  },

  async getWorkoutsInRange() {
    const res = await fetch(`/api/workouts/range`);
    const json = await res.json();

    return json;
  },

  async getAllWorkouts() {
    console.log("loading all")
    const res = await fetch ('/api/allworkouts')
    const json = await res.json();
    return json;
  },

  async deleteWorkout(id) {
    const res = await fetch(`/api/delete/${id}`,{
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log(res)
    const json = await res.json();
    return json;
  },

  async getFilteredWorkouts(type,searchName,totalDurationHigh, totalDurationLow, dayUp, dayDown,distanceUp, distanceDown) {
    // const res = await fetch(`/api/filter/${type}/${searchName}/${totalDurationLow}/${totalDurationHigh}/${dayUp}/${dayDown}`,{
    const res = await fetch(`/api/filter/${type}/${searchName}/${dayUp}/${dayDown}/${distanceUp}/${distanceDown}`,{
      method: 'get',
      headers: { "Content-Type": "application/json" }
    })
    const json = await res.json();
    console.log(json)
    return json;
  },

  async deleteEmptyWorkout () {
    const res = await fetch("/api/delete-empty", {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    const json = await res.json();
    return json;
  }

};
