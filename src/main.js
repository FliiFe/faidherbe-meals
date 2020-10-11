import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

window.localStorage.meals = window.localStorage.meals || ''
window.localStorage.money = window.localStorage.money == undefined ? -1 : window.localStorage.money
window.localStorage.cookie = ''

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

document.addEventListener('deviceready', () => {
    window.StatusBar.backgroundColorByHexString("#fafafa");
    window.StatusBar.styleDefault();
})
