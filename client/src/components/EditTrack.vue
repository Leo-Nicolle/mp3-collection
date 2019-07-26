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
      <i class="icon-checked" @click="onValidate()"></i>
      <i class="icon-cancel" @click="onCancel()"></i>
      <i class="icon-cloud" @click="onCloud()"></i>
    </div>
    <AutoTagModal ref="autoTagModal" :rows="rows" />
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";
import AutoTagModal from "./AutoTagModal";

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
      artist: "",
      album: "",
      title: ""
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
    getInitialvalue(key) {
      return this.rows.length
        ? this.rows
            .reduce((keys, row) => {
              const entry = keys.find(a => a.artist === row[key]);

              if (entry && entry[key] !== "unknown") {
                entry.count++;
              } else {
                const entry = { count: 1 };
                entry[key] = row[key];
                keys.push(entry);
              }
              return keys;
            }, [])
            .sort((a, b) => b.count - a.count)[0][key]
        : "";
    },
    onValueChange(key, value) {
      // checks if there is a replace  in the field
      const replace = value.match(/r\((.*),(.*)\)/);
      if (replace) {
        try {
          new RegExp(replace[1]);
        } catch (e) {
          return;
        }
      }
      this.rows.forEach(row => {
        const newValue = replace
          ? row.dirty[key].oldValue
              .slice()
              .replace(new RegExp(replace[1]), replace[2])
          : value;

        row[key] = newValue;
        row.dirty[key].newValue = newValue;
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
          axios.post(`${serverUrl}update-track-metadata`, {
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
    },
    onCloud() {
      this.$refs.autoTagModal.show();
    }
  },
  watch: {
    title: function(newValue) {
      this.onValueChange("title", newValue);
    },
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
            },
            album: {
              oldValue: row.album
            },
            title: {
              oldValue: row.title
            }
          })
      );
      this.artist = this.getInitialvalue("artist");
      this.album = this.getInitialvalue("album");
    }
  },
  components: {
    AutoTagModal
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
  margin-right: 12px;
  flex: 0.1;
}
.edit-track label {
  flex: 1;
}
.edit-track div i {
  margin-right: 12px;
}
</style>
