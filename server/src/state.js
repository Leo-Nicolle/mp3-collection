const fs = require("fs");
const statePath = "data/database-state-2.json";

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

class State {
  constructor() {
    this.debounceSave = 0;
    this.data = {};
    this.data.audioFileIndex = 0;
    this.data.dataFileIndex = 0;
    this.data.allArtistsFile = false;
    this.data.audioFilesToCopy = [];
    this.data.xhr = {
      ratio: 0,
      tasks: 0,
      taskIndex: 0
    };
    if (fs.existsSync(statePath)) {
      this.data = JSON.parse(fs.readFileSync(statePath));
    }

    Object.keys(this.data).forEach(key => {
      console.log(key);
      Object.defineProperty(this, key, {
        get: function() {
          return this.data[key];
        },
        set: function(newValue, { save = true } = {}) {
          this.data[key] = newValue;
          if (save) {
            this.save();
          }
        }
      });
    });
  }

  save() {
    if (this.debounceSave) {
      clearTimeout(this.debounceSave);
    }
    this.debounceSave = setTimeout(() => {
      fs.writeFile(statePath, JSON.stringify(this.data), () => {});
    }, 400);
  }

  incrementAudioFileIndex() {}
  incrementTask() {
    this.xhr.taskIndex = this.xhr.taskIndex + 1;
    this.xhr.ratio = this.xhr.taskIndex / this.xhr.tasks;
  }
  reinitTasks({ name, tasks }) {
    this.xhr.taskIndex = 0;
    this.xhr.ratio = 0;
    this.xhr.name = name;
    this.xhr.tasks = tasks;
  }
}

const state = new State();
export default state;
