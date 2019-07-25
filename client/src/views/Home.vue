<template>
  <div class="home">
    <Header class="header" />
    <Content class="content" :view="$route.name" />
  </div>
</template>

<script>
// @ is an alias to /src
import Content from "@/components/Content.vue";
import Header from "@/components/Header.vue";

import axios from "axios";

export default {
  name: "home",
  components: {
    Content,
    Header
  },
  mounted() {
    console.log("here", this.eventBus);
    // axios.get("http://localhost:4000").then(({ data }) => console.log(data));
  }
};
</script>

<style>
.home {
  margin: 4px 6px 4px 6px;
  width: 100%;
}
.header {
}
.content {
  overflow-y: hidden;
}
</style>
