<template>
  <div class="content">
    <TrackList />
  </div>
</template>

<script>
import TrackList from "./TrackList";

export default {
  name: "Content",

  components: {
    TrackList
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
