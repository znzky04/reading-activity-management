<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo">
        <router-link to="/">阅读活动管理系统</router-link>
      </div>
      
      <el-tabs v-model="activeTab" class="auth-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            @submit.prevent="handleLogin"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="loginForm.email" 
                placeholder="请输入邮箱" 
                type="email"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="loginForm.password" 
                placeholder="请输入密码" 
                type="password"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-button type="text" size="small">忘记密码？</el-button>
            </div>
            
            <el-form-item>
              <el-button 
                type="primary" 
                class="submit-btn" 
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            @submit.prevent="handleRegister"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="请输入邮箱" 
                type="email"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="registerForm.password" 
                placeholder="请输入密码" 
                type="password"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                placeholder="请再次输入密码" 
                type="password"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                class="submit-btn" 
                :loading="loading"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="auth-footer">
      &copy; {{ new Date().getFullYear() }} 阅读活动管理系统 - 版权所有
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

// 状态
const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

// 注册表单
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

// 校验规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      loading.value = true
      console.log('开始登录...')
      
      const result = await userStore.login(loginForm)
      console.log('登录结果:', result)
      
      ElMessage({
        type: 'success',
        message: '登录成功！'
      })
      
      // 等待消息显示完毕后再强制导航
      setTimeout(() => {
        // 根据角色跳转到不同页面
        const targetRoute = result.role === 'admin' ? '/admin/dashboard' : '/dashboard'
        console.log('尝试导航到:', targetRoute)
        
        // 使用 replace 强制跳转
        window.location.href = targetRoute
      }, 1000)
    } catch (error) {
      ElMessage.error('登录失败，请检查账号密码')
      console.error('登录错误:', error)
    } finally {
      loading.value = false
    }
  })
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      loading.value = true
      await userStore.register(registerForm)
      
      ElMessage({
        type: 'success',
        message: '注册成功！请前往邮箱验证。'
      })
      
      // 跳转到验证页面
      router.push({
        path: '/verify',
        query: { email: registerForm.email }
      })
    } catch (error) {
      ElMessage.error('注册失败，请稍后再试')
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  padding: 30px;
  margin-bottom: 20px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.logo a {
  color: var(--primary-color);
  text-decoration: none;
}

.auth-tabs {
  width: 100%;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.auth-footer {
  color: var(--text-light);
  font-size: 14px;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .auth-card {
    padding: 20px;
  }
}
</style> 