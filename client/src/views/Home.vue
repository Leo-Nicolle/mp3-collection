<template>
  <div class="home">
    <Header />
    <Content />
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
    console.log("ici");
    // axios.get("http://localhost:4000").then(({ data }) => console.log(data));
  }
};
</script>
