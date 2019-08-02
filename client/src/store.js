import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { serverUrl } from "./js/utils";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mp3Path: ".",
    addPath: ".",
    musicPaths: [],
    columnsVisible: {
      title: true,
      album: true,
      artist: true,
      path: false,
      added: true
    },
    query: {},
    searchFilter: {}
  },
  mutations: {
    addMusicPath(state, path) {
      state.musicPaths = state.musicPaths.concat(path);
    },
    removeMusicPath(state, path) {
      state.musicPaths = state.musicPaths.filter(p => p !== path);
    },
    setMp3Path(state, path) {
      state.mp3Path = path;
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
