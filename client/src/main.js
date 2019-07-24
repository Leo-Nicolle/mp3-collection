import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;
const eventBus = new Vue();
const eventBusMixin = {
  data: function() {
    return {
      eventBus
    };
  }
};
new Vue({
  router,
  mixins: [eventBusMixin],
  store,
  render: h => h(App)
}).$mount("#app");
