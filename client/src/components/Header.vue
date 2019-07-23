<template>
  <div class="header">
    <span class="mp3-button">
      <i class="icon-mp3-player" @click="onMp3Click()"></i>
      <FileModal
        ref="mp3Modal"
        :title="'mp3 location:'"
        @validate="onMp3ModalValidate"
        :value="$store.state.mp3Path"
      />
    </span>
    <span>
      <i class="icon-add" @click="onAddClick()"></i>
      <FileModal
        ref="addModal"
        :title="'to add:'"
        @validate="onAddValidate"
        :value="$store.state.addPath"
      />
    </span>
  </div>
</template>

<script>
import axios from "axios";
import FileModal from "./FileModal";

export default {
  name: "Header",
  props: {
    msg: String
  },
  data() {
    return {};
  },
  methods: {
    onMp3Click(evt) {
      this.$refs.mp3Modal.show();
    },
    onAddClick(evt) {
      this.$refs.addModal.show();
    },
    onMp3ModalValidate(path) {
      this.$store.commit("setMp3Path", path);
    },
    onAddValidate(path) {
      this.$store.commit("setAddPath", path);
    }
  },
  components: {
    FileModal
  },
  mounted() {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  margin: 1em 1em 1em 1em;
  display: flex;
  justify-content: space-between;
}
.header > span > i {
  font-size: 2em;
  cursor: pointer;
}
</style>
