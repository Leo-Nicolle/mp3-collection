<template>
  <div class="track-list">
    <TrackList :rows="rows" />
  </div>
</template>

<script>
import TrackList from "./TrackList";

import axios from "axios";
import { serverUrl } from "../js/utils";
import { mapState } from "vuex";
export default {
  name: "Mp3List",
  data() {
    return {
      rows: []
    };
  },
  computed: {
    ...mapState(["query"])
  },
  methods: {
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
  mounted() {
    this.requestQuery();
  },
  watch: {
    query: function(newValue) {
      this.requestQuery(newValue);
    }
  },
  components: {
    TrackList
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
