import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue'),
    meta: { title: '登录/注册' }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('../views/Verify.vue'),
    meta: { title: '邮箱验证' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '用户主页', requiresAuth: true }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('../views/Logs.vue'),
    meta: { title: '阅读日志管理', requiresAuth: true }
  },
  {
    path: '/logs/:id',
    name: 'LogDetail',
    component: () => import('../views/LogDetail.vue'),
    meta: { title: '日志详情', requiresAuth: true }
  },
  {
    path: '/logs/create',
    name: 'LogCreate',
    component: () => import('../views/LogEdit.vue'),
    meta: { title: '新增日志', requiresAuth: true }
  },
  {
    path: '/logs/edit/:id',
    name: 'LogEdit',
    component: () => import('../views/LogEdit.vue'),
    meta: { title: '编辑日志', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '设置', requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/Messages.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/Feedback.vue'),
    meta: { title: '反馈', requiresAuth: true }
  },
  {
    path: '/appeal',
    name: 'Appeal',
    component: () => import('../views/Appeal.vue'),
    meta: { title: '申诉', requiresAuth: true }
  },
  // 管理员路由
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { title: '管理员主页', requiresAuth: true, isAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/Users.vue'),
    meta: { title: '用户管理', requiresAuth: true, isAdmin: true }
  },
  {
    path: '/admin/reviews',
    name: 'AdminReviews',
    component: () => import('../views/admin/Reviews.vue'),
    meta: { title: '日志审核', requiresAuth: true, isAdmin: true }
  },
  {
    path: '/admin/feedbacks',
    name: 'AdminFeedbacks',
    component: () => import('../views/admin/Feedbacks.vue'),
    meta: { title: '用户反馈管理', requiresAuth: true, isAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置标题
  document.title = to.meta.title ? `${to.meta.title} - 阅读活动管理系统` : '阅读活动管理系统'
  
  // 获取token (模拟登录状态)
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole') // 'user' 或 'admin'
  
  console.log('[路由守卫] 检查权限:', { 
    path: to.fullPath, 
    requiresAuth: to.meta.requiresAuth, 
    isAdmin: to.meta.isAdmin,
    token: !!token,
    userRole
  })
  
  // 需要登录的页面
  if (to.meta.requiresAuth && !token) {
    console.log('[路由守卫] 需要登录，重定向到登录页')
    next({ name: 'Auth' })
  } 
  // 需要管理员权限的页面
  else if (to.meta.isAdmin && userRole !== 'admin') {
    console.log('[路由守卫] 需要管理员权限，重定向到用户主页')
    next({ name: 'Dashboard' })
  }
  // 已登录用户访问登录页，重定向到主页
  else if (token && (to.name === 'Auth' || to.path === '/auth')) {
    console.log('[路由守卫] 已登录用户访问登录页，重定向到相应主页')
    next({ name: userRole === 'admin' ? 'AdminDashboard' : 'Dashboard' })
  }
  else {
    console.log('[路由守卫] 允许访问:', to.fullPath)
    next()
  }
})

export default router 