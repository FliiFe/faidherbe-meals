import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import VueCordova from 'vue-cordova'


import Main from './Main.vue';
import MealsLogin from './Meals/Login.vue'

Vue.use(VueCordova)
Vue.use(VueRouter);
Vue.use(Vuetify);
Vue.config.productionTip = false;

const router = new VueRouter({
    routes: [{
        path: '/',
        component: Main
    }, {
        path: '/mealslogin',
        component: MealsLogin
    }]
});

new Vue({
    render: h => h(App),
    router
}).$mount('#app');

document.addEventListener('deviceready', _ => {
    StatusBar.backgroundColorByHexString("#fafafa");
    StatusBar.styleDefault();
})
