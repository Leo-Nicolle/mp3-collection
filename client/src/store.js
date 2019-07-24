import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { serverUrl } from "./js/utils";

Vue.use(Vuex);

function upload(state) {
  const stateCopy = Object.assign({}, state);
  stateCopy.searchFilter = {};
  axios.post(`${serverUrl}state`, { state: stateCopy });
}

export default new Vuex.Store({
  state: {
    mp3Path: ".",
    addPath: ".",
    query: {},
    searchFilter: {}
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
    },
    setQuery(state, query) {
      state.query = { ...query };
      upload(state);
    },
    setSearchFilter(state, filter) {
      state.searchFilter = { ...filter };
      upload(state);
    }
  },
  actions: {}
});
