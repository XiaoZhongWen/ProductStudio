/*
 * @Author: 肖仲文 xiaozhongwen@mye.hk
 * @Date: 2024-03-12 11:04:28
 * @LastEditors: 肖仲文 xiaozhongwen@mye.hk
 * @LastEditTime: 2024-03-12 17:25:23
 * @FilePath: /beginner/vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/style/globalVar.scss";'
      }
    }
  }
})
