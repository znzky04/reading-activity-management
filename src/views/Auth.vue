<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo">
        <router-link to="/">Reading Activity Management System</router-link>
      </div>
      
      <el-tabs v-model="activeTab" class="auth-tabs">
        <el-tab-pane label="Login" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            @submit.prevent="handleLogin"
          >
            <el-form-item label="Email" prop="email">
              <el-input 
                v-model="loginForm.email" 
                placeholder="Please enter email" 
                type="email"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="Password" prop="password">
              <el-input 
                v-model="loginForm.password" 
                placeholder="Please enter password" 
                type="password"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">Remember me</el-checkbox>
              <el-button type="text" size="small">Forgot password?</el-button>
            </div>
            
            <el-form-item>
              <el-button 
                type="primary" 
                class="submit-btn" 
                :loading="loading"
                @click="handleLogin"
              >
                Login
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="Register" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            @submit.prevent="handleRegister"
          >
            <el-form-item label="Email" prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="Please enter email" 
                type="email"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="Password" prop="password">
              <el-input 
                v-model="registerForm.password" 
                placeholder="Please enter password" 
                type="password"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="Confirm Password" prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                placeholder="Please enter password again" 
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
                Register
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="auth-footer">
      &copy; {{ new Date().getFullYear() }} Reading Activity Management System - All rights reserved
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
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter correct email format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password length cannot be less than 6 digits', trigger: 'blur' }
  ]
}

const registerRules = {
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter correct email format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password length cannot be less than 6 digits', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please enter password again', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('Two input passwords are inconsistent'))
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
      console.log('Start login...')
      
      const result = await userStore.login(loginForm)
      console.log('Login result:', result)
      
      ElMessage({
        type: 'success',
        message: 'Login successful!'
      })
      
      // Wait for message display to complete before forcing navigation
      setTimeout(() => {
        // Navigate based on role
        const targetRoute = result.role === 'admin' ? '/admin/dashboard' : '/dashboard'
        console.log('Attempting to navigate to:', targetRoute)
        
        // Use replace to force redirect
        window.location.href = targetRoute
      }, 1000)
    } catch (error) {
      ElMessage.error('Login failed, please check account password')
      console.error('Login error:', error)
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
        message: 'Registration successful! Please go to email for verification.'
      })
      
      // Jump to verification page
      router.push({
        path: '/verify',
        query: { email: registerForm.email }
      })
    } catch (error) {
      ElMessage.error('Registration failed, please try again later')
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

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-card {
    padding: 20px;
  }
}
</style> 