<template>
  <div class="header">
    <div class="mp3-button">
      <i class="icon-mp3-player" @click="onMp3Click()"></i>
      <FileModal ref="FileModal" />
    </div>
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
    return {
      modalVisible: true
    };
  },
  methods: {
    onMp3Click(evt) {
      this.$refs.FileModal.show();
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
}
.icon-mp3-player {
  font-size: 2em;
  cursor: pointer;
}
</style>
