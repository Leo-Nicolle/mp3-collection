<template>
  <div>
    <Modal ref="modal" @validate="onValidate" @cancel="onCancel">
      <div slot="modal-title" class="modal-title">
        <p>
          <strong>Settings</strong>
        </p>
      </div>
      <div slot="modal-body" class="modal-body">
        <label v-for="key in Object.keys(columnsVisible)">
          <input type="checkbox" v-model="columnsVisible[key]" />
          {{ key }}
        </label>
      </div>
    </Modal>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";
import Modal from "./Modal";
import { mapState } from "vuex";

export default {
  name: "SettingsModal",
  data() {
    return {};
  },
  computed: {
    ...mapState(["columnsVisible"])
  },
  methods: {
    onValidate() {
      this.eventBus.$emit("saveState");
      this.$emit("validate", this.path);
    },
    onCancel() {
      this.$emit("cancel");
    },
    show() {
      this.$refs.modal.show();
    }
  },
  components: { Modal },
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
  margin-left: 16px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: auto;
}

li > i {
  margin-right: 5px;
}
</style>
