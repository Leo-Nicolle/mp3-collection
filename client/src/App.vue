<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "App",
  mounted() {
    axios.get("http://localhost:4000/state").then(({ data }) => {
      this.$store.commit("setState", data);
    });
  }
};
</script>
<style></style>
