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
  mounted() {
    axios.get(`${serverUrl}state`).then(({ data }) => {
      this.$store.commit("setState", data);
    });
  }
};
</script>
<style></style>
