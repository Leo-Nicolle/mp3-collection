<template>
  <div class="content">
    <Mp3List />
  </div>
</template>

<script>
import Mp3List from "./Mp3List";

export default {
  name: "Content",

  props: {
    view: {
      type: String,
      default: "mp3"
    }
  },
  components: {
    Mp3List
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.icon-delete {
  margin-left: 6px;
}
.content {
  margin: 12px;
}
</style>
