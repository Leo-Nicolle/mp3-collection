<template>
  <div class="header">
    <ProgressBar
      :visible="progressVisible"
      @progress-stop="progressVisible = false"
    />
    <div>
      <span class="buttons-container">
        <i class="icon-mp3-player" @click="onMp3Click()"></i>
        <FileModal
          ref="mp3Modal"
          :title="'mp3 location:'"
          @validate="onMp3ModalValidate"
          :value="$store.state.mp3Path"
        />
        <i class="icon-add" @click="onAddClick()"></i>
        <FileModal
          ref="addModal"
          :title="'to add:'"
          @validate="onAddValidate"
          :value="$store.state.addPath"
        />
        <i class="icon-settings" @click="onSettingsClick()"></i>
        <SettingsModal ref="settingsModal" />
      </span>
      <SearchBar />
    </div>
    <div class="filters">
      <h5 class="filters-title">Filters Active:</h5>
      <p v-for="filter in filters" @click="onFilterClick(filter)">
        <strong>{{ filter[0] }}</strong> {{ filter[1] }}
        <i class="icon-delete"> </i>
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import FileModal from "./FileModal";
import SettingsModal from "./SettingsModal";
import SearchBar from "./SearchBar";
import ProgressBar from "./ProgressBar";

import { serverUrl } from "../js/utils";

import { mapState } from "vuex";
export default {
  name: "Header",
  data() {
    return {
      progressVisible: true
    };
  },
  computed: {
    ...mapState(["query"]),
    filters: function() {
      return Object.entries(this.query);
    }
  },
  methods: {
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
    onMp3ModalValidate(path) {
      this.$store.commit("setMp3Path", path);
    },
    onAddValidate(path) {
      this.$store.commit("setAddPath", path);
      axios.post(`${serverUrl}add`, {
        file: {
          path,
          type: "folder"
        }
      });
      this.progressVisible = true;
    }
  },
  components: {
    FileModal,
    ProgressBar,
    SettingsModal,
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
</style>
