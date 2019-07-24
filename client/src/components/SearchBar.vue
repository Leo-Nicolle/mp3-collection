<template>
  <span class="search-bar">
    <div class="search-container">
      <i class="icon-search"></i>
      <input
        type="search"
        name="search"
        v-model="value"
        placeholder="Search..."
      />
      <input type="submit" value="Search" class="searchButton" />
    </div>
  </span>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";
import escapeStringRegexp from "escape-string-regexp";

export default {
  name: "SearchBar",
  data() {
    return {
      value: ""
    };
  },
  watch: {
    value: function(newValue) {
      const artist = newValue.match(/ar:(.*),/);
      if (artist) {
        newValue.replace(artist[1], "");
      }
      const album = newValue.match(/al:(.*),/);
      if (album) {
        newValue.replace(album[1], "");
      }

      const track = newValue.match(/tr:(.*),/);
      if (track) {
        newValue.replace(track[1], "");
      }
      const searchFilter = {};
      [
        {
          reg: new RegExp("ar:(.*),"),
          name: "artist"
        },
        {
          reg: new RegExp("al:(.*),"),
          name: "album"
        },
        {
          reg: new RegExp("tr:(.*),"),
          name: "track"
        }
      ]
        .map(({ reg, name }) => {
          const match = newValue.match(reg);
          if (!match) return { reg, name };
          newValue.replace(match[0], "");
          return { reg, name, match: match[1] };
        })
        .forEach(({ reg, name, match }) => {
          if (match) {
            searchFilter[name] = {
              reg: `.*(${escapeStringRegexp(match)}).*`,
              weight: 1
            };
          } else {
            searchFilter[name] = {
              reg: `.*(${escapeStringRegexp(newValue)}).*`,
              weight: 0.5
            };
          }
        });

      this.$store.commit("setSearchFilter", searchFilter);
    }
  },

  methods: {},
  components: {},
  mounted() {
    this.$store.commit("setSearchFilter", {});
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.search-container {
  display: inline-flex;
  flex: 1 1 300px;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
}
</style>
