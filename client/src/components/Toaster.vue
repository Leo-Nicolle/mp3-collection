<template>
  <div class="toaster-container">
    <ul>
      <li
        v-for="toaster in toasters"
        :class="`toaster-${toaster.style}`"
        @click="onClick(toaster)"
      >
        <i v-if="toaster.icon" :class="toaster.icon"></i>
        {{ toaster.text }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";

export default {
  name: "Toaster",
  data() {
    return {
      toasters: [{ text: "coucou", icon: "icon-folder" }],
      defaultTiming: 1000
    };
  },
  methods: {
    onClick(toaster) {
      this.remove(toaster);
    },
    remove(toaster) {
      this.toasters = this.toasters.filter(t => t !== toaster);
    },
    toast(data) {
      const toaster = Object.assign(
        {
          text: "",
          timing: 3000,
          style: "info",
          icon: false
        },
        data
      );
      if (toaster.style === "error") {
        toaster.icon = "icon-cancel";
      }
      this.toasters = this.toasters.concat(toaster);
      // setTimeout(() => this.remove(toaster), toaster.timing);
    }
  },
  watch: {},
  mounted() {
    this.eventBus.$on("toast", data => this.toast(data));
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.toaster-container {
  z-index: 1000;
  position: absolute;
  top: 0;
  left: calc(100vw - 155px);
  min-width: 150px;
  max-width: 150;
  text-align: center;
}

.toaster-container > ul > li {
  border-radius: 15px;
}
.toaster-container > ul > li > i {
  margin-right: 15px;
}

ul > li.toaster-info {
  background-color: var(--main-green);
}
ul > li.toaster-warning {
  background-color: var(--main-orange);
}
.toaster-error {
  background-color: var(--main-red);
}
</style>
