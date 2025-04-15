import { createRouter, createWebHistory } from 'vue-router'

// Route configuration
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue'),
    meta: { title: 'Login/Register' }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('../views/Verify.vue'),
    meta: { title: 'Email Verification' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: 'User Dashboard', requiresAuth: true }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('../views/Logs.vue'),
    meta: { title: 'Reading Log Management', requiresAuth: true }
  },
  {
    path: '/logs/:id',
    name: 'LogDetail',
    component: () => import('../views/LogDetail.vue'),
    meta: { title: 'Log Details', requiresAuth: true }
  },
  {
    path: '/logs/create',
    name: 'LogCreate',
    component: () => import('../views/LogEdit.vue'),
    meta: { title: 'Create Log', requiresAuth: true }
  },
  {
    path: '/logs/edit/:id',
    name: 'LogEdit',
    component: () => import('../views/LogEdit.vue'),
    meta: { title: 'Edit Log', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: 'Settings', requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/Messages.vue'),
    meta: { title: 'Message Center', requiresAuth: true }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/Feedback.vue'),
    meta: { title: 'Feedback', requiresAuth: true }
  },
  {
    path: '/appeal',
    name: 'Appeal',
    component: () => import('../views/Appeal.vue'),
    meta: { title: 'Appeal', requiresAuth: true }
  },
  // Admin routes
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { title: 'Admin Dashboard', requiresAuth: true, isAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/Users.vue'),
    meta: { title: 'User Management', requiresAuth: true, isAdmin: true }
  },
  {
    path: '/admin/reviews',
    name: 'AdminReviews',
    component: () => import('../views/admin/Reviews.vue'),
    meta: { title: 'Log Review', requiresAuth: true, isAdmin: true }
  },
  {
    path: '/admin/feedbacks',
    name: 'AdminFeedbacks',
    component: () => import('../views/admin/Feedbacks.vue'),
    meta: { title: 'User Feedback Management', requiresAuth: true, isAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - Reading Activity Management System` : 'Reading Activity Management System'
  
  // Get token (simulated login state)
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole') // 'user' or 'admin'
  
  console.log('[Route Guard] Checking permissions:', { 
    path: to.fullPath, 
    requiresAuth: to.meta.requiresAuth, 
    isAdmin: to.meta.isAdmin,
    token: !!token,
    userRole
  })
  
  // Pages requiring login
  if (to.meta.requiresAuth && !token) {
    console.log('[Route Guard] Login required, redirecting to login page')
    next({ name: 'Auth' })
  } 
  // Pages requiring admin permissions
  else if (to.meta.isAdmin && userRole !== 'admin') {
    console.log('[Route Guard] Admin permissions required, redirecting to user dashboard')
    next({ name: 'Dashboard' })
  }
  // Logged in users accessing login page, redirect to dashboard
  else if (token && (to.name === 'Auth' || to.path === '/auth')) {
    console.log('[Route Guard] Logged in user accessing login page, redirecting to appropriate dashboard')
    next({ name: userRole === 'admin' ? 'AdminDashboard' : 'Dashboard' })
  }
  else {
    console.log('[Route Guard] Access allowed:', to.fullPath)
    next()
  }
})

export default router 