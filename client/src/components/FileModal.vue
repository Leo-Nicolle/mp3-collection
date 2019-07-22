<template>
  <div class="modal" v-if="visible">
    <div class="overlay"></div>
    <div class="modal-content">
      <div class="modal-title">
        <p><strong>mp3 location:</strong> {{ path }}</p>
      </div>
      <div class="modal-body">
        <div>
          <ul>
            <li v-for="file in files" @click="onDirClick(file)">
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
export default {
  name: "FileModal",
  data() {
    return {
      visible: true,
      content: "",
      path: ".",
      files: []
    };
  },
  methods: {
    onDirClick(file) {
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
    async getFolderContent() {
      this.files = await axios
        .post(`http://localhost:4000/folder`, {
          path: this.path
        })
        .then(({ data }) => data);
    }
  },
  components: {},
  mounted() {
    this.getFolderContent().then(() => {
      const path = this.files[0].path;
      this.path = path.slice(0, path.length - 3);
    });
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
.modal-title p {
  margin: 0;
  margin-top: 0.5em;
  margin-left: 1.5em;
  font-size: 0.85em;
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
</style>