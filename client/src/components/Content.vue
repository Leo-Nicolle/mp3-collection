<template>
  <div class="content">
    <SearchBar />

    <TrackList />
  </div>
</template>

<script>
import TrackList from "./TrackList";
import SearchBar from "./SearchBar";

export default {
  name: "Content",
  props: {
    msg: String
  },
  components: {
    TrackList,
    SearchBar
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content {
  margin: 12px;
}
</style>
