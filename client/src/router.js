import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "mp3",
      component: Home
    },
    {
      path: "/add",
      name: "add",
      component: Home
    }
  ]
});
