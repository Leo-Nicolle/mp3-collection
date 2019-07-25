<template>
  <div class="edit-track" v-if="rows.length">
    <div>
      <!-- <label>
        title
        <input type="text" v-model="title" />
      </label>
      <label>
        album
        <input type="text" v-model="album" />
      </label> -->
      <label>
        artist
        <input type="text" v-model="artist" @change="onValidate('artist')" />
      </label>
      <i class=" icon-checked" @click="onValidate('artist')"></i>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";
import { mapState } from "vuex";
export default {
  name: "EditTrack",
  props: {
    rows: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      artist: ""
    };
  },
  methods: {
    requestQuery() {
      axios
        .post(`${serverUrl}scanfiles`, {
          path: this.$store.state.addPath
        })
        .then(({ data }) => {
          this.rows = data.map(({ metadata }) => metadata);
        });
    },
    getArtist() {
      return this.rows.length
        ? this.rows
            .reduce((artists, { artist }) => {
              const entry = artists.find(a => a.artist === artist);

              if (entry) {
                entry.count++;
              } else {
                artists.push({
                  artist,
                  count: 1
                });
              }
              return artists;
            }, [])
            .sort((a, b) => a.count - b.count)[0].artist
        : "";
    },
    onValueChange(key, value) {
      this.rows.forEach(row => {
        row[key] = value;
        if (!row.dity) {
          row.dirty = {};
        }
        row.dirty[key] = true;
      });
    },
    onValidate(key) {
      this.rows
        .filter(row => Object.values(row.dirty).some(v => v.dirty))
        .forEach(row => {
          const updates = {};
          Object.keys(row.dirty).forEach(key => {
            updates[key] = row[key];
          });
          axios.post(`${serverUrl}update-metadata`, {
            path: row.path,
            updates
          });
        });
    }
  },
  watch: {
    artist: function(newValue) {
      this.onValueChange("artist", newValue);
    },
    album: function(newValue) {
      this.onValueChange("album", newValue);
    },
    rows: function() {
      this.artist = this.getArtist();
    }
  }
};
</script>

<style scoped></style>
