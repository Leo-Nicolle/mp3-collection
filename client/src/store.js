import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { serverUrl } from "./js/utils";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mp3Path: ".",
    addPath: ".",
    columnsVisible: {
      title: true,
      album: true,
      artist: true,
      date: true
    },
    query: {},
    searchFilter: {}
  },
  mutations: {
    setMp3Path(state, path) {
      state.mp3Path = path;
    },
    setAddPath(state, path) {
      state.addPath = path;
    },
    setState(state, newState) {
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    setQuery(state, query) {
      state.query = { ...query };
    },
    setSearchFilter(state, filter) {
      state.searchFilter = { ...filter };
    }
  },
  actions: {}
});
