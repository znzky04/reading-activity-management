<template>
  <div class="layout">
    <!-- Top Navigation Bar -->
    <header class="header">
      <div class="container header-container">
        <div class="logo">
          <router-link to="/">
            <font-awesome-icon icon="book" class="logo-icon" />
            Reading Activity Management
          </router-link>
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
          <el-menu-item index="/">
            <font-awesome-icon icon="home" class="menu-icon" />
            Home
          </el-menu-item>
          
          <!-- Menu items shown after login -->
          <template v-if="userStore.isLoggedIn">
            <el-menu-item index="/dashboard">
              <font-awesome-icon icon="tasks" class="menu-icon" />
              My Dashboard
            </el-menu-item>
            <el-menu-item index="/logs">
              <font-awesome-icon :icon="['far', 'bookmark']" class="menu-icon" />
              Reading Logs
            </el-menu-item>
            <el-menu-item index="/messages">
              <font-awesome-icon :icon="['far', 'comment']" class="menu-icon" />
              Messages
            </el-menu-item>
            <el-menu-item index="/feedback">
              <font-awesome-icon :icon="['far', 'thumbs-up']" class="menu-icon" />
              Feedback
            </el-menu-item>
            
            <!-- Admin menu -->
            <template v-if="userStore.isAdmin">
              <el-sub-menu index="/admin">
                <template #title>
                  <font-awesome-icon icon="cog" class="menu-icon" />
                  Administration
                </template>
                <el-menu-item index="/admin/dashboard">
                  <font-awesome-icon icon="chart-line" class="menu-icon" />
                  Admin Dashboard
                </el-menu-item>
                <el-menu-item index="/admin/users">
                  <font-awesome-icon :icon="['far', 'user']" class="menu-icon" />
                  User Management
                </el-menu-item>
                <el-menu-item index="/admin/reviews">
                  <font-awesome-icon icon="eye" class="menu-icon" />
                  Log Reviews
                </el-menu-item>
                <el-menu-item index="/admin/feedbacks">
                  <font-awesome-icon :icon="['far', 'comment']" class="menu-icon" />
                  User Feedback
                </el-menu-item>
              </el-sub-menu>
            </template>
          </template>
        </el-menu>
        
        <div class="user-actions">
          <!-- Login/Register button for guests -->
          <template v-if="!userStore.isLoggedIn">
            <el-button type="text" @click="$router.push('/auth')">
              <font-awesome-icon :icon="['far', 'user']" class="button-icon" />
              Login / Register
            </el-button>
          </template>
          
          <!-- User avatar and dropdown menu for logged in users -->
          <template v-else>
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-avatar">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar || ''"></el-avatar>
                <span class="username">{{ userStore.userInfo?.email }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="dashboard">
                    <font-awesome-icon icon="tasks" class="dropdown-icon" />
                    My Dashboard
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <font-awesome-icon icon="cog" class="dropdown-icon" />
                    Settings
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <font-awesome-icon icon="sign-out-alt" class="dropdown-icon" />
                    Logout
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </header>
    
    <!-- Main Content Area -->
    <main class="main-content">
      <div class="container">
        <slot></slot>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>
          © {{ new Date().getFullYear() }} Reading Activity Management System - Developed with Vue 3
          <span class="social-icons">
            <font-awesome-icon :icon="['fab', 'github']" class="social-icon" />
            <font-awesome-icon :icon="['fab', 'weixin']" class="social-icon" />
          </span>
        </p>
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

// Current active menu item
const activeIndex = computed(() => route.path)

// Handle user dropdown menu commands
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  color: var(--el-color-primary);
  font-size: 24px;
}

.menu {
  flex: 1;
  border-bottom: none;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

.button-icon {
  margin-right: 5px;
}

.dropdown-icon {
  margin-right: 5px;
  width: 16px;
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

.social-icons {
  display: inline-flex;
  gap: 12px;
  margin-left: 15px;
}

.social-icon {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.social-icon:hover {
  color: var(--el-color-primary);
}

/* Responsive adjustments */
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