<template>
  <div class="header">
    <ProgressBar
      :visible="progressVisible"
      @progress-stop="progressVisible = false"
    />
    <div>
      <span class="buttons-container">
        <span>
          <i class="icon-folder" @click="onFolderClick()"></i>
          <span class="tooltip">Music folders</span>
          <FoldersModal ref="folderModal" @validate="onFolderModalValidate" />
        </span>
        <span>
          <i class="icon-mp3-player" @click="onMp3Click()"></i>
          <span class="tooltip">Mp3 path</span>
          <FileModal
            ref="mp3Modal"
            :title="'mp3 location:'"
            @validate="onMp3ModalValidate"
            :value="$store.state.mp3Path"
          />
        </span>
        <span>
          <i class="icon-settings" @click="onSettingsClick()"> </i>
          <span class="tooltip">Settings</span>
          <SettingsModal ref="settingsModal" />
        </span>
        <span>
          <i class="icon-sync" @click="onSyncClick()"></i>
          <span class="tooltip">Sync with mp3</span>
        </span>
      </span>
      <SearchBar />
    </div>
    <div class="filters">
      <h5 class="filters-title">Filters Active:</h5>
      <p v-for="filter in filters" @click="onFilterClick(filter)">
        <strong>{{ filter[0] }}</strong>
        {{ filter[1] | formatFilter(filter[0]) }}
        <i class="icon-delete"> </i>
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import FileModal from "./FileModal";
import FoldersModal from "./FoldersModal";

import SettingsModal from "./SettingsModal";
import SearchBar from "./SearchBar";
import ProgressBar from "./ProgressBar";

import { serverUrl } from "../js/utils";

import { mapState } from "vuex";
export default {
  name: "Header",
  data() {
    return {
      progressVisible: false
    };
  },
  computed: {
    ...mapState(["query"]),
    filters: function() {
      return Object.entries(this.query);
    }
  },
  filters: {
    formatFilter(value, key) {
      if (key === "added") {
        return new Date(value.value).toLocaleDateString();
      } else if (key === "track") {
        return value.title;
      } else {
        return value.name;
      }
      return value;
    }
  },
  methods: {
    onFolderClick() {
      this.$refs.folderModal.show();
    },
    onFolderModalValidate() {},
    onFilterClick(filter) {
      const query = Object.entries(this.query).reduce((query, [key, value]) => {
        if (key !== filter[0]) {
          query[key] = value;
        }
        return query;
      }, {});
      this.$store.commit("setQuery", query);
    },
    onMp3Click(evt) {
      this.$refs.mp3Modal.show();
    },
    onAddClick(evt) {
      this.$refs.addModal.show();
    },
    onSettingsClick() {
      this.$refs.settingsModal.show();
    },
    onSyncClick() {
      axios.post(`${serverUrl}update-data-files`);
    },
    onMp3ModalValidate(path) {
      this.$store.commit("setMp3Path", path);
    },
    onAddValidate(path) {
      this.$store.commit("setAddPath", path);
      axios
        .post(`${serverUrl}add`, {
          file: {
            path,
            type: "folder"
          }
        })
        .then(response => {
          console.log("add response", response);
        })
        .catch(error => {
          console.error("add error", error);
        });

      this.progressVisible = true;
    }
  },
  components: {
    FileModal,
    ProgressBar,
    SettingsModal,
    FoldersModal,
    SearchBar
  },
  mounted() {
    this.eventBus.$on("start-progress", () => (this.progressVisible = true));
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  margin: 0 1em 0em 1em;
}
.header > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
i {
  margin-right: 15px;
}
.header span > i {
  font-size: 2em;
  cursor: pointer;
}
.header > .filters {
  justify-content: start;
}
.filters-title {
  margin-bottom: 0;
  margin-top: 0;
  margin-right: 16px;
}
.filters > p {
  cursor: pointer;
  padding-left: 25px;
  font-size: 0.8em;
  padding: 0.2em;
  margin: 0;
}
.filters > p:hover {
  font-size: 0.85em;
  padding: 0.1em;
}

.filters > p > strong {
  margin-right: 5px;
}
.buttons-container {
  display: flex;
}
.tooltip {
  display: none;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px;
  border-radius: 6px;
  position: relative;
  z-index: 1;
  margin-left: -48px;
  left: calc(50% + 12px);
  top: -10px;
  opacity: 0;
  transition: 1s;
}
.tooltip::after {
  content: "";
  position: absolute;
  top: calc(50% - 5px);
  left: -5px;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent #555 transparent transparent;
}
*:hover > .tooltip {
  display: initial;
  opacity: 1;
}
</style>
