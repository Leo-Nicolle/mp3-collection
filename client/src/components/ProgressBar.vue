<template>
  <div v-if="visible" class="progress-bar-container">
    <span>{{ text }}</span>
    <div class="meter-container">
      <div class="meter">
        <span :style="getProgressStyle()"></span>
      </div>
      <p class="task">{{ task }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { serverUrl } from "../js/utils";

export default {
  name: "ProgressBar",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: "Progress"
    }
  },
  data() {
    return {
      xhr: 0,
      task: "copyFIle",
      interval: 0
    };
  },
  methods: {
    start() {
      this.interval = setInterval(() => {
        axios.get(`${serverUrl}xhr`).then(({ data }) => {
          this.xhr = data.ratio;
          this.task = data.task;
        });
      }, 400);
    },
    stop() {
      clearInterval(this.interval);
      this.$emit("progress-stop");
    },
    getProgressStyle() {
      return `width: ${Math.ceil(this.xhr * 100)}%`;
    }
  },
  watch: {
    visible: function(newValue) {
      if (newValue) {
        this.start();
      } else {
        this.stop();
      }
    },
    xhr: function(newValue) {
      if (newValue !== 1) return;
      this.stop();
    }
  },
  mounted() {
    if (this.visible) {
      this.start();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header > .progress-bar-container {
  display: inline-flex;
  align-items: flex-end;
  width: 100%;
  font-size: 0.6em;
  font-weight: 100;
  font-family: "Open-Sans";
}
.meter-container {
  flex: 1;
  margin-left: 6px;
  margin-right: 6px;
}
.meter {
  height: 10px;
}
.meter > span {
  display: block;
  height: 100%;
  border-radius: 8px;
  background-image: repeating-linear-gradient(
    -55deg,
    #444,
    #444 10px,
    #666 10px,
    #666 20px
  );
  overflow: hidden;
}
.meter > span {
  animation: move 2s linear infinite;
}
@keyframes move {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}
</style>
