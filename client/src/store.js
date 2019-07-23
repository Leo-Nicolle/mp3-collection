import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

function upload(state) {
  axios.post("http://localhost:4000/state", { state });
}

export default new Vuex.Store({
  state: {
    mp3Path: ".",
    addPath: "."
  },
  mutations: {
    setMp3Path(state, path) {
      state.mp3Path = path;
      upload(state);
    },
    setAddPath(state, path) {
      state.addPath = path;
      upload(state);
    },
    setState(state, newState) {
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    }
  },
  actions: {}
});
