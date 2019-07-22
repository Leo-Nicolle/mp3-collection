import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mp3Path: ""
  },
  mutations: {
    setMp3Path(state, path) {
      state.mp3Path = path;
    }
  },
  actions: {}
});
