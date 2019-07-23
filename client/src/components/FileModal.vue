<template>
  <div class="modal" v-if="visible">
    <div class="overlay"></div>
    <div class="modal-content">
      <div class="modal-title">
        <p>
          <strong>{{ title }}</strong> {{ path }}
        </p>
        <i class="icon-refresh" @click="refresh()"></i>
      </div>
      <div class="modal-body">
        <div>
          <ul>
            <li v-for="file in files" @click="onDirClick(file)">
              <i :class="getIconClass(file)"></i>
              {{ file.name }}
            </li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <span class="modal-cancel" @click="onCancel()">cancel</span>
        <span class="modal-ok" @click="onValidate()">ok</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";
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
      this.hide();
    },
    onCancel() {
      this.$emit("cancel");
      this.hide();
    },
    hide() {
      this.visible = false;
    },
    show() {
      this.visible = true;
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
  components: {},
  mounted() {},
  watch: {
    value: function(newValue, oldValue) {
      this.path = newValue;
      this.getFolderContent();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background: #555;
}
.modal-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  margin: auto;
  width: 50%;
  min-width: 500px;

  min-height: 100px;
  border: solid black 1px;
  border-radius: 3px;
  background: #fff;
  z-index: 2;
}
.modal-body {
  max-height: 400px;
  overflow-y: auto;
  /* margin: 0.25em; */
}
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

.modal-footer {
  position: relative;
  bottom: 0;
  margin: 0;
}
.modal-ok {
  float: right;
  margin-right: 5px;
  cursor: pointer;
}
.modal-cancel {
  margin-left: 5px;
  cursor: pointer;
}
ul {
  color: #fff;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0;
}
li {
  padding: 1em;
  margin-bottom: 0.125em;
  cursor: pointer;
}
li:first-child {
  margin-top: 0.25em;
}
li:hover {
  font-size: 1.1em;
  padding: 0.85em;
}
li:nth-child(odd) {
  background-color: #444;
}
li:nth-child(even) {
  background-color: #333;
}
li > i {
  margin-right: 5px;
}
</style>
