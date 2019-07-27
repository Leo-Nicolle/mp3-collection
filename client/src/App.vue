<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "./js/utils";

export default {
  name: "App",
  methods: {
    upload() {
      const stateCopy = Object.assign({}, this.$store.state);
      stateCopy.searchFilter = {};
      axios.post(`${serverUrl}state`, { state: stateCopy });
      console.log(`upload`);
    }
  },

  mounted() {
    this.$nextTick(() => {
      axios
        .get(`${serverUrl}state`)
        .then(({ data }) => {
          this.$store.commit("setState", data);
        })
        .finally(() => {
          this.$store.subscribe((mutation, state) => {
            this.upload();
          });
          console.log(this.eventBus);
          this.eventBus.$on("saveState", () => {
            this.upload();
          });
        });
    });
  }
};
</script>
<style>
#app {
  margin: 8px;
  overflow: hidden;
}
</style>
