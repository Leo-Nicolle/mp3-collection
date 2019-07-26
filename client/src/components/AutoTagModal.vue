<template>
  <div>
    <Modal ref="modal" @validate="onValidate" @cancel="onCancel">
      <div slot="modal-title" class="modal-title">
        <p><strong>Auto Tags</strong></p>
      </div>

      <div slot="modal-body" class="modal-body">
        <div v-if="artistToTag">
          <ul>
            <li class="row">
              <span v-for="colmun in columns">{{ colmun | capitalize }}</span>
              <span>{{ "select" | capitalize }}</span>
            </li>
            <li v-for="option in artistToTag.options">
              <label class="row">
                <span v-for="colmun in columns">{{
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
      visible: false,
      artistsToTag: [],
      albumsToTag: [],
      tracksToTag: [],
      selected: null,
      columns: ["name", "country", "type", "disambiguation"]
    };
  },
  methods: {
    onValidate() {
      if (this.artistToTag && this.selected) {
        const selected = this.selected;
        const updates = {
          name: selected.name,
          "sort-name": selected["sort-name"],
          id: selected.id
        };
        axios.post(`${serverUrl}update-artist-metadata`, {
          name: this.artistToTag.name,
          updates
        });
      }
      this.shift();
      // this.$emit("validate", this.path);
    },
    shift() {
      if (this.artistToTag.length) {
        this.artistToTag = this.artistsToTag.shift();
        this.show();
      }
    },
    onCancel() {
      this.$emit("cancel");
    },
    show() {
      const names = [...new Set(this.rows.map(({ artist }) => artist))];
      Promise.all(
        names.map(artistName => musicBrainz.findPossibleArtist(artistName))
      )
        .then(optionsPerName => {
          this.artistsToTag = optionsPerName.map((options, i) => ({
            options: options.map(o => ({ ...o, selected: false })),
            name: names[i]
          }));
          this.$refs.modal.show();
        })
        .catch(e => console.error(e));
    }
  },
  filters: {
    format(elt) {
      return elt || "unknown";
    }
  },
  components: { Modal },
  computed: {
    artistToTag: function() {
      return this.artistsToTag[0];
    }
  },
  mounted() {}
};
</script>
}
<style scoped>
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
