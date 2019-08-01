<template>
  <div id="app">
    <Toaster />
    <router-view />
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "./js/utils";
import Toaster from "./components/Toaster.vue";

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
          if (!data) return;
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
  },
  components: {
    Toaster
  }
};
</script>
<style>
#app {
  margin: 8px;
  overflow: hidden;
}
</style>
