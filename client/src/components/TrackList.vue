<template>
  <div class="track-list">
    <div class="controls"></div>
    <ul>
      <li class="row-title">
        <input
          class="checkbox"
          type="checkbox"
          v-if="checkboxes"
          @change="onCheckboxTitleChange($event)"
        />
        <span class="title-title">title</span>
        <span class="album-title">Album</span>
        <span class="artist-title">Artist</span>
        <i class="icon-edit" v-if="checkboxes" style="z-index: -1" />
      </li>
      <li v-for="row in filteredRows" class="row">
        <input
          class="checkbox"
          type="checkbox"
          v-if="checkboxes"
          v-model="row.selected"
        />
        <span class="title" @click="onClick(row, 'title')">{{
          row.title
        }}</span>
        <span class="album" @click="onClick(row, 'album')">{{
          row.album
        }}</span>
        <span class="artist" @click="onClick(row, 'artist')">{{
          row.artist
        }}</span>
        <i class="icon-edit" v-if="checkboxes" />
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
    },
    checkboxes: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
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
              return points + row[key].match(reg) ? weight : 0;
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
    onClick(row, type) {
      const query = Object.assign({}, this.query);
      query[type] = escapeStringRegexp(row[type]);
      this.$store.commit("setQuery", query);
    },
    onCheckboxTitleChange(event) {
      this.filteredRows.map(r => (r.selected = event.target.checked));
      this.$emit("select-change", this.filteredRows.filter(r => r.selected));
      this.$forceUpdate();
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
.checkbox {
  cursor: pointer;
  margin-right: 12px;
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
