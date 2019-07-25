<template>
  <div class="edit-track" v-if="rows.length">
    <h4>Edit:</h4>
    <label>
      title
      <input type="text" v-model="title" />
    </label>
    <label>
      album
      <input type="text" v-model="album" />
    </label>
    <label>
      artist
      <input type="text" v-model="artist" />
    </label>
    <div>
      <i class=" icon-checked" @click="onValidate()"></i>
      <i class=" icon-cancel" @click="onCancel()"></i>
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

              if (entry && entry.artist !== "unknown") {
                entry.count++;
              } else {
                artists.push({
                  artist,
                  count: 1
                });
              }
              return artists;
            }, [])
            .sort((a, b) => b.count - a.count)[0].artist
        : "";
    },
    onValueChange(key, value) {
      this.rows.forEach(row => {
        row[key] = value;
        row.dirty[key].newValue = value;
      });
    },
    onValidate() {
      this.rows
        .filter(row => row.dirty && Object.values(row.dirty).length)
        .forEach(row => {
          const updates = {};
          Object.keys(row.dirty).forEach(key => {
            if (!row.dirty[key].newValue) return;
            updates[key] = row.dirty[key].newValue;
          });
          axios.post(`${serverUrl}update-metadata`, {
            hash: row.hash,
            updates
          });
          this.eventBus.$emit("start-progress");
        });
    },
    onCancel() {
      this.rows.forEach(row => {
        Object.entries(row.dirty).forEach(([key, values]) => {
          if (!values.newValue) return;
          row[key] = values.oldValue;
        });
        delete row.dirty;
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
      this.rows.forEach(
        row =>
          (row.dirty = {
            artist: {
              oldValue: row.artist
            }
          })
      );
      this.artist = this.getArtist();
    }
  }
};
</script>

<style scoped>
.edit-track {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.edit-track h4 {
  margin: 0;
  flex: 0.1;
}
.edit-track label {
  flex: 1;
}
.edit-track div i {
  margin-right: 12px;
}
</style>
