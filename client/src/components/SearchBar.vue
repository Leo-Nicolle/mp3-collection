<template>
  <div class="track-list"></div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";

export default {
  name: "SearchBar",
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
ul {
  margin: 12px;
}
li {
  display: flex;
  justify-content: space-between;
}
li > span {
  flex: 1;
}
li > span:hover {
  text-decoration: underline;
}

.row {
  list-style: none;
  font-weight: 400;
  font-style: normal;
  font-size: 0.8em;
}
.row:hover {
  font-size: 0.9em;
}
</style>
