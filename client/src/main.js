import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'

import { initSentry } from './plugins/sentry'

Vue.config.productionTip = false
Vue.use(Vuetify)

const vuetify = new Vuetify({
  icons: { iconfont: 'mdi' },
})

initSentry(Vue, router)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')
