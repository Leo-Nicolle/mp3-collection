<template>
  <div class="track-list">
    <div class="controls"></div>
    <ul>
      <li class="row-title">
        <span class="track-title">name</span>
        <span class="album-title">Album</span>
        <span class="artist-title">Artist</span>
      </li>
      <li v-for="row in filteredRows" class="row">
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
import { serverUrl } from "../js/utils";
import { mapState } from "vuex";
import escapeStringRegexp from "escape-string-regexp";
export default {
  name: "TrackList",
  props: {
    rows: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      indexToPropMap: ["artist", "album", "track"],
      propToIndexMap: { artist: 0, album: 1, track: 2 }
    };
  },
  computed: {
    ...mapState(["query", "searchFilter"]),
    filteredRows: function() {
      const searchFilter = this.searchFilter;
      if (!Object.keys(searchFilter).length) {
        return this.rows;
      }
      return this.rows
        .map(row => ({
          row,
          points: Object.entries(searchFilter).reduce(
            (points, [key, weightAndReg]) => {
              const weight = weightAndReg.weight;
              if (!weight) return points;
              const reg = weightAndReg.reg;
              return points + row[this.propToIndexMap[key]].match(reg)
                ? weight
                : 0;
            },
            0
          )
        }))
        .filter(({ points }) => points)
        .sort((a, b) => a.points - b.points)
        .map(({ row }) => row);
    }
  },
  methods: {
    onClick(row, type, index) {
      const query = Object.assign({}, this.query);
      query[type] = escapeStringRegexp(row[index]);
      this.$store.commit("setQuery", query);
    }
  }
};
</script>

<style scoped>
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
