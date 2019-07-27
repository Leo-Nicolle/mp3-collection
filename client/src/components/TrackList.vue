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
        <span
          v-for="key in Object.keys(columnsVisible)"
          v-if="columnsVisible[key]"
        >
          {{ key | capitalize }}
          <i
            class="icon-sort"
            @click="onClickSortBy(key)"
            :style="{
              transform: `translateY(${
                key === sortBy && order < 0 ? -0.2 : 0.3
              }em) scaleY(${key === sortBy ? order : 1})`
            }"
          ></i>
        </span>
        <i class="icon-edit" v-if="checkboxes" style="z-index: -1" />
      </li>
    </ul>
    <ul class="ul-list">
      <li v-for="row in filteredRows" class="row">
        <input
          class="checkbox"
          type="checkbox"
          v-if="checkboxes"
          v-model="row.selected"
          @change="onCheckboxChange($event)"
        />
        <span
          v-for="key in Object.keys(columnsVisible)"
          v-if="columnsVisible[key]"
          @click="onClick(row, key)"
          :class="key"
        >
          {{ row[key] | formatKey(key) }}
        </span>
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
    return {
      sortBy: "title",
      order: -1
    };
  },
  filters: {
    formatKey(value, key) {
      if (key === "added") {
        return new Date(value).toLocaleDateString();
      }
      return value;
    }
  },
  computed: {
    ...mapState(["query", "searchFilter", "columnsVisible"]),
    filteredRows: function() {
      if (!Object.keys(this.searchFilter).length) {
        return this.rows.sort((a, b) =>
          a[this.sortBy] < b[this.sortBy] ? this.order : -this.order
        );
      }
      return this.rows
        .map(row => ({
          row,
          points: Object.entries(this.searchFilter).reduce(
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
        .sort((a, b) => {
          const diff = a.points - b.points;
          return diff === 0
            ? a.row[this.sortBy] < b.row[this.sortBy]
              ? this.order
              : -this.order
            : a - b;
        })
        .map(({ row }) => row);
    }
  },
  methods: {
    onClick(row, type) {
      const query = Object.assign({}, this.query);
      if (type === "added") {
        query[type] = { value: row[type] };
      } else {
        query[type] = escapeStringRegexp(row[type]);
      }
      this.$store.commit("setQuery", query);
    },
    onCheckboxTitleChange(event) {
      this.filteredRows.map(r => (r.selected = event.target.checked));
      this.$emit("select-change", this.filteredRows.filter(r => r.selected));
      this.$forceUpdate();
    },
    onCheckboxChange() {
      this.$emit("select-change", this.filteredRows.filter(r => r.selected));
    },
    onClickSortBy(key) {
      this.order *= -1;
      this.sortBy = key;
      this.$forceUpdate();
    }
  }
};
</script>

<style scoped>
.ul-list {
  max-height: 80vh;
  overflow-y: scroll;
  margin-top: -4px;
}
.row-title {
  background: #333;
}
.row-title span {
  display: flex;
  justify-content: space-between;
}
.row-title span i {
  margin-right: 24px;
  font-size: 0.7em;
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

.icon-sort {
  text-decoration: none !important;
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
.row:last-child {
  background: red;
  margin-bottom: 77px;
}
</style>
