/*
 * @Author: 肖仲文 xiaozhongwen@mye.hk
 * @Date: 2024-03-12 11:04:28
 * @LastEditors: 肖仲文 xiaozhongwen@mye.hk
 * @LastEditTime: 2024-03-12 14:46:50
 * @FilePath: /beginner/src/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
app.mount('#app')
