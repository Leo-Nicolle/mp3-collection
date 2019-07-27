import Vue from "vue";
import io from "socket.io-client";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import { socketUrl } from "./js/utils";

Vue.config.productionTip = false;

const eventBus = new Vue();

var serverSocket = io(socketUrl);
serverSocket.on("connect", function() {});
serverSocket.on("disconnect", function() {});
Vue.mixin({
  data() {
    return {
      eventBus,
      serverSocket
    };
  },
  filters: {
    capitalize: function(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
