import Vue from 'vue';
import VueRouter from 'vue-router';
import Battlekards from './components/battlekards';
import Home from './components/home';
import PageNotFound from './components/pagenotfound';

Vue.use(VueRouter);
Vue.config.productionTip = false;

const routes = [
  { path: '/', component: Home },
  { path: '/battle', component: Battlekards },
  { path: '*', component: PageNotFound },
];

const router = new VueRouter({
  routes,
});

/* eslint-disable-next-line no-new */
new Vue({
  router,
}).$mount('#app');
