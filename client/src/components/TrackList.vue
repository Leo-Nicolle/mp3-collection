<template>
  <div class="track-list">
    <div class="controls"></div>
    <ul>
      <li class="row-title">
        <span class="track-title">name</span>
        <span class="album-title">Album</span>
        <span class="artist-title">Artist</span>
      </li>
      <li v-for="row in rows" class="row">
        <span class="track" @click="onClick(row, 'track', 2)">{{
          row[2]
        }}</span>
        <span class="album" @click="onClick(row, 'album', 1)">{{
          row[1]
        }}</span>
        <span class="artist" @click="onClick(row, 'artist', 0)">{{
          row[0]
        }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl, requestQuery } from "../js/utils";
import { mapState } from "vuex";
import escapeStringRegexp from "escape-string-regexp";
export default {
  name: "TrackList",
  props: {
    msg: String
  },
  data() {
    return {
      rows: []
    };
  },
  computed: mapState(["query"]),
  methods: {
    onClick(row, type, index) {
      const query = {};
      query[type] = escapeStringRegexp(row[index]);
      this.$store.commit("setQuery", query);
    },
    requestQuery() {
      axios
        .post(`${serverUrl}query`, {
          query: this.$store.state.query
        })
        .then(({ data }) => {
          this.rows = data;
        });
    }
  },
  components: {},
  mounted() {
    this.requestQuery();
  },
  watch: {
    query: function(newValue) {
      this.requestQuery(newValue);
    }
  }
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
