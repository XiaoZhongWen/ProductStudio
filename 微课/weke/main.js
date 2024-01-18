import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

uni.$zp = {
	config: {
		//配置分页默认pageSize为15
		'default-page-no': 0,
		'default-page-size': 10,
	}
}

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  return {
    app
  }
}
// #endif