import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import './styles/main.css'

// Font Awesome 配置
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// 导入你需要的图标
import { 
  faBook, faUserSecret, faHeart, faHome, faTasks, 
  faCalendarAlt, faChartLine, faCog, faSignOutAlt,
  faEdit, faTrash, faEye, faPlus, faSave, faTimes,
  faSearch, faFilter, faSort, faSortUp, faSortDown,
  faSpinner, faCircleNotch, faBell, faHeading, 
  faListUl, faQuoteLeft, faTag
} from '@fortawesome/free-solid-svg-icons'
import { 
  faBookmark, faComment, faClock, faCalendar, 
  faThumbsUp, faThumbsDown, faFile, faUser
} from '@fortawesome/free-regular-svg-icons'
import { 
  faGithub, faTwitter, faFacebook, faWeixin, 
  faQq, faWeibo
} from '@fortawesome/free-brands-svg-icons'

// 添加图标到库中
library.add(
  // 实心图标
  faBook, faUserSecret, faHeart, faHome, faTasks, 
  faCalendarAlt, faChartLine, faCog, faSignOutAlt,
  faEdit, faTrash, faEye, faPlus, faSave, faTimes,
  faSearch, faFilter, faSort, faSortUp, faSortDown,
  faSpinner, faCircleNotch, faBell, faHeading,
  faListUl, faQuoteLeft, faTag,
  // 线性图标
  faBookmark, faComment, faClock, faCalendar,
  faThumbsUp, faThumbsDown, faFile, faUser,
  // 品牌图标
  faGithub, faTwitter, faFacebook, faWeixin,
  faQq, faWeibo
)

const app = createApp(App)

// 注册Font Awesome组件
app.component('font-awesome-icon', FontAwesomeIcon)

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
