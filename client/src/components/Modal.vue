<template>
  <div class="modal" v-if="visible">
    <div class="overlay"></div>
    <div class="modal-content">
      <slot name="modal-title"></slot>
      <div class="modal-body">
        <slot name="modal-body"></slot>
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
  name: "Modal",
  data() {
    return {
      visible: false,
      content: "",
      path: ".",
      files: []
    };
  },
  methods: {
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
    }
  },
  components: {},
  mounted() {},
  watch: {}
};
</script>
<style>
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
</style>
