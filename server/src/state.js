const fs = require("fs");
const statePath = "data/database-state-2.json";
let state = {};
if (fs.existsSync(statePath)) {
  state = JSON.parse(fs.readFileSync(statePath));
} else {
  state = {
    audioFolderIndex: 0,
    audioFileIndex: 0,
    dataFolderIndex: 0,
    dataFileIndex: 0,
    audioFilesToCopy: [],
    xhr: {
      ratio: 0,
      tasks: 0,
      taskIndex: 0,
      name: ""
    }
  };
}
state.incrementTask = function() {
  state.xhr.taskIndex++;
  state.xhr.ratio = state.taskIndex / state.tasks;
};
state.reinitTasks = function({ name, tasks }) {
  state.xhr.taskIndex = 0;
  state.xhr.ratio = 0;
  state.xhr.name = name;
  state.xhr.tasks = tasks;
};
export default state;
