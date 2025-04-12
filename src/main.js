import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import './styles/main.css'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 添加路由调试
router.beforeEach((to, from, next) => {
  console.log(`[路由导航] 从 ${from.fullPath} 到 ${to.fullPath}`)
  next()
})

router.afterEach((to, from) => {
  console.log(`[路由导航完成] 当前路由: ${to.fullPath}`)
})

app.use(ElementPlus)
app.use(router)
app.use(pinia)

app.mount('#app')
