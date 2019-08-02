<template>
  <div>
    <Modal ref="modal" @validate="onValidate" @cancel="onCancel">
      <div slot="modal-title" class="modal-title">
        <label v-if="value">
          <strong>Auto Tag {{ state | capitalize }}</strong>
          <input type="text" v-model="value.name" @change="onInputChange" />
        </label>
      </div>

      <div slot="modal-body" class="modal-body">
        <div v-if="value">
          <ul>
            <li class="row">
              <span v-for="colmun in columns[state]">{{
                colmun | capitalize
              }}</span>
              <span>{{ "select" | capitalize }}</span>
            </li>
            <li v-for="option in value.options">
              <label class="row">
                <span v-for="colmun in columns[state]">{{
                  option[colmun] | format
                }}</span>
                <input
                  type="radio"
                  name="selected"
                  v-model="selected"
                  :value="option"
                />
              </label>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";
import Modal from "./Modal";
import musicBrainz from "../js/MusicBrainz";

export default {
  name: "AutoTagModal",
  props: {
    rows: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      value: null,
      state: "",
      trackIds: [],
      artistsToTag: [],
      albumsToTag: [],
      tracksToTag: [],
      selected: null,
      columns: {
        artist: ["name", "country", "type", "disambiguation"],
        album: ["name"],
        track: ["name"]
      }
    };
  },
  methods: {
    onValidate() {
      if (this.value && this.selected) {
        const selected = this.selected;
        const metadata = {
          "sort-name": selected["sort-name"],
          name: selected.name,
          mid: selected.id
        };
        this.trackIds.forEach(trackId => {
          axios.post(`${serverUrl}update-metadata`, {
            table: this.state,
            trackId,
            metadata
          });
        });
      }
      this.shift();
      // this.$emit("validate", this.path);
    },
    shift() {
      if (this.artistsToTag.length) {
        const { trackIds, artistName } = this.artistsToTag.shift();
        this.trackIds = trackIds;
        this.getValueForArtistName({ artistName }).then(() => {
          this.$refs.modal.show();
          this.state = "artist";
        });
      } else if (this.albumsToTag.length) {
        const albumName = this.albumsToTag.shift();
        this.getValueForAlbumName({ albumName }).then(() => {
          this.$refs.modal.show();
          this.state = "album";
        });
      }
    },
    onCancel() {
      this.$emit("cancel");
    },
    show() {
      this.artistsToTag = [
        ...new Set(this.rows.map(({ artist }) => artist))
      ].map(artistName => ({
        artistName,
        trackIds: this.rows
          .filter(r => r.artist === artistName)
          .map(({ id }) => id)
      }));
      this.shift();
    },
    getValueForArtistName({ artistName, originalName = false } = {}) {
      if (!originalName) {
        originalName = artistName;
      }
      return musicBrainz
        .findPossibleArtist(artistName, { limit: 20 })
        .then(options => {
          this.value = {
            options: options.map(o => ({ ...o, selected: false })),
            name: artistName.slice(),
            originalName
          };
        });
    },
    getValueForAlbumName({ albumName, originalName = false } = {}) {
      if (!originalName) {
        originalName = albumName;
      }
      return musicBrainz
        .findPossibleAlbums(albumName, { limit: 20 })
        .then(options => {
          this.value = {
            options: options.map(o => ({ ...o, selected: false })),
            name: albumName.slice(),
            originalName
          };
        });
    },
    onInputChange() {
      this.getValueForArtistName({
        artistName: this.value.name,
        originalName: this.value.originalName
      });
    }
  },
  filters: {
    format(elt) {
      return elt || "unknown";
    }
  },
  components: { Modal }
};
</script>

<style scoped>
label strong {
  margin-right: 12px;
}
.modal-body ul {
  max-height: 80vh;
  overflow-y: scroll;
}
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.row * {
  text-align: left;
  flex: 1;
}
label.row {
  cursor: pointer;
}
</style>
