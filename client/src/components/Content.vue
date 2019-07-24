<template>
  <div class="content">
    <SearchBar />
    <h5 class="filters-title">Filters Active:</h5>
    <div class="filters-container">
      <p v-for="filter in filters" @click="onFilterClick(filter)">
        <strong>{{ filter[0] }}</strong> {{ filter[1] }}
        <i class="icon-delete"> </i>
      </p>
    </div>

    <TrackList />
  </div>
</template>

<script>
import TrackList from "./TrackList";
import SearchBar from "./SearchBar";
import { mapState } from "vuex";

export default {
  name: "Content",
  computed: {
    ...mapState(["query"]),
    filters: function() {
      return Object.entries(this.query);
    }
  },
  methods: {
    onFilterClick(filter) {
      const query = this.query;
      delete query[filter[0]];
      this.$store.commit("setQuery", query);
    }
  },
  components: {
    TrackList,
    SearchBar
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.icon-delete {
  margin-left: 6px;
}
.content {
  margin: 12px;
}
.filters-title {
  margin-bottom: 0;
}
.filters-container {
  cursor: pointer;
  padding-left: 25px;
  font-size: 0.8em;
  padding: 0.2em;
}
.filters-container:hover {
  font-size: 0.85em;
  padding: 0.1em;
}

.filters-container > p > strong {
  margin-right: 5px;
}
</style>
