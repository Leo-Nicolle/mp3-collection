<template>
  <div class="track-list"></div>
</template>

<script>
import axios from "axios";

export default {
  name: "TrackList",
  props: {
    msg: String
  },
  data() {
    return {};
  },
  methods: {},
  components: {},
  mounted() {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  margin: 1em 1em 1em 1em;
  display: flex;
  justify-content: space-between;
}
.header > span > i {
  font-size: 2em;
  cursor: pointer;
}
</style>
