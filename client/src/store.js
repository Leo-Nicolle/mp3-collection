import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mp3Path: "",
    addPath: ""
  },
  mutations: {
    setMp3Path(state, path) {
      state.mp3Path = path;
    },
    setAddPath(state, path) {
      state.addPath = path;
    }
  },
  actions: {}
});
