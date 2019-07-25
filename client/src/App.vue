<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "./js/utils";
import musicBrainz from "./js/MusicBrainz";

export default {
  name: "App",
  mounted() {
    // musicBrainz
    //   .search({ key: "artist", value: "Jacob Miller" })
    //   .then(response => {
    //     console.log(response);
    //   });

    this.$nextTick(() => {
      axios.get(`${serverUrl}state`).then(({ data }) => {
        this.$store.commit("setState", data);
      });
    });
  }
};
</script>
<style>
#app {
  margin: 8px;
}
</style>
