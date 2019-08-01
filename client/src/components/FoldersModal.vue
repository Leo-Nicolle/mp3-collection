<template>
  <div>
    <Modal ref="modal" @validate="onValidate" @cancel="onCancel">
      <div slot="modal-title" class="modal-title">
        <p>
          <strong>Music Folders </strong>
        </p>
        <i class="icon-add" @click="addFolder()"></i>
      </div>

      <div slot="modal-body" class="modal-body">
        <ul>
          <li v-for="path in musicPaths">
            {{ path }}
            <i class="icon-cancel" @click="onDelete(path)"></i>
          </li>
        </ul>
      </div>
    </Modal>
    <FileModal
      :title="'Path of the new Folder'"
      ref="fileModal"
      v-on:validate="onAddValidate"
      :value="musicPaths[0]"
    />
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import { serverUrl } from "../js/utils";
import Modal from "./Modal";
import FileModal from "./FileModal";

export default {
  name: "FoldersModal",
  props: {},
  data() {
    return {
      visible: false,
      newPath: "."
    };
  },
  computed: {
    ...mapState(["musicPaths"])
  },

  methods: {
    onValidate() {
      this.$emit("validate");
    },
    onDelete(path) {
      this.$store.commit("removeMusicPath", path);
    },
    onAddValidate(path) {
      if (this.musicPaths.some(p => p.includes(path))) {
        this.eventBus.$emit("toast", { text: "path exists", style: "error" });
        return;
      }
      this.$store.commit("addMusicPath", path);
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

      this.eventBus.$emit("start-progress");
    },
    addFolder() {
      this.$refs.fileModal.show();
    },
    onCancel() {
      this.$emit("cancel");
    },
    show() {
      this.$refs.modal.show();
    }
  },
  components: { Modal, FileModal },
  mounted() {},
  watch: {
    visible: function(newValue, oldValue) {
      if (!newValue) return;
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
.modal-body > ul > li {
  display: flex;
  justify-content: space-around;
}
li > i {
  margin-right: 5px;
}
</style>
