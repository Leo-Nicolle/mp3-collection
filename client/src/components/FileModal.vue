<template>
  <div>
    <Modal ref="modal" @validate="onValidate" @cancel="onCancel">
      <div slot="modal-title" class="modal-title">
        <p>
          <strong>{{ title }}</strong> {{ path }}
        </p>
        <i class="icon-refresh" @click="refresh()"></i>
      </div>

      <div slot="modal-body" class="modal-body">
        <ul>
          <li v-for="file in files" @click="onDirClick(file)">
            <i :class="getIconClass(file)"></i>
            {{ file.name }}
          </li>
        </ul>
      </div>
    </Modal>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";
import Modal from "./Modal";

export default {
  name: "FileModal",
  props: {
    title: {
      type: String,
      default: ""
    },
    value: {
      type: String,
      default: "."
    }
  },
  data() {
    return {
      visible: false,
      content: "",
      path: ".",
      files: []
    };
  },
  methods: {
    getIconClass({ type }) {
      return (
        "icon-" +
        (type === "folder"
          ? "folder"
          : type === "audio"
          ? "music-note"
          : "file")
      );
    },
    onDirClick(file) {
      if (file.type !== "folder") return;
      this.path = file.path;
      this.getFolderContent();
    },
    onValidate() {
      this.$emit("validate", this.path);
    },
    onCancel() {
      this.$emit("cancel");
    },
    show() {
      this.$refs.modal.show();
    },
    refresh() {
      this.getFolderContent();
    },
    async getFolderContent() {
      this.files = await axios
        .post(`${serverUrl}folder`, {
          path: this.path
        })
        .then(({ data }) => data);
    }
  },
  components: { Modal },
  mounted() {},
  watch: {
    value: function(newValue, oldValue) {
      this.path = newValue;
      this.getFolderContent();
    },
    visible: function(newValue, oldValue) {
      if (!newValue) return;
      this.getFolderContent();
    }
  }
};
</script>
}
<style scoped>
.modal-title {
  display: flex;
  justify-content: space-between;
}
.modal-title p {
  margin: 0;
  margin-top: 0.5em;
  margin-left: 1.5em;
}
.modal-title i {
  margin-top: 0.5em;
  margin-right: 1.5em;
  cursor: pointer;
}
.modal-body {
  max-height: 400px;
  overflow-y: auto;
}

li > i {
  margin-right: 5px;
}
</style>
