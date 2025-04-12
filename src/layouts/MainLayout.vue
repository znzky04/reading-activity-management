<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container header-container">
        <div class="logo">
          <router-link to="/">阅读活动管理系统</router-link>
        </div>
        
        <el-menu
          class="menu"
          mode="horizontal"
          :ellipsis="false"
          :default-active="activeIndex"
          background-color="#FFFFFF"
          text-color="#333333"
          active-text-color="#4A90E2"
          router
        >
          <el-menu-item index="/">首页</el-menu-item>
          
          <!-- 登录后显示的菜单 -->
          <template v-if="userStore.isLoggedIn">
            <el-menu-item index="/dashboard">我的主页</el-menu-item>
            <el-menu-item index="/logs">阅读日志</el-menu-item>
            <el-menu-item index="/messages">消息中心</el-menu-item>
            <el-menu-item index="/feedback">反馈</el-menu-item>
            
            <!-- 管理员菜单 -->
            <template v-if="userStore.isAdmin">
              <el-sub-menu index="/admin">
                <template #title>管理功能</template>
                <el-menu-item index="/admin/dashboard">管理员主页</el-menu-item>
                <el-menu-item index="/admin/users">用户管理</el-menu-item>
                <el-menu-item index="/admin/reviews">日志审核</el-menu-item>
                <el-menu-item index="/admin/feedbacks">用户反馈</el-menu-item>
              </el-sub-menu>
            </template>
          </template>
        </el-menu>
        
        <div class="user-actions">
          <!-- 未登录显示登录注册按钮 -->
          <template v-if="!userStore.isLoggedIn">
            <el-button type="text" @click="$router.push('/auth')">登录 / 注册</el-button>
          </template>
          
          <!-- 已登录显示用户头像和下拉菜单 -->
          <template v-else>
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-avatar">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar || ''"></el-avatar>
                <span class="username">{{ userStore.userInfo?.email }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="dashboard">我的主页</el-dropdown-item>
                  <el-dropdown-item command="settings">设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <slot></slot>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} 阅读活动管理系统 - 基于 Vue 3 开发</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 当前激活的菜单
const activeIndex = computed(() => route.path)

// 处理用户下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/')
  } else {
    router.push(`/${command}`)
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  align-items: center;
  height: 60px;
}

.logo {
  margin-right: 40px;
  font-size: 20px;
  font-weight: 600;
}

.logo a {
  color: var(--primary-color);
  text-decoration: none;
}

.menu {
  flex: 1;
  border-bottom: none;
}

.user-actions {
  margin-left: 20px;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-content {
  flex: 1;
  padding: 24px 0;
}

.footer {
  background-color: #FFFFFF;
  border-top: 1px solid var(--border-color);
  padding: 24px 0;
  color: var(--text-light);
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }
  
  .logo {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .menu {
    width: 100%;
  }
  
  .user-actions {
    margin: 10px 0 0;
  }
}
</style> 