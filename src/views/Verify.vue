<template>
  <div class="verify-container">
    <div class="verify-card">
      <div class="logo">
        <router-link to="/">阅读活动管理系统</router-link>
      </div>
      
      <div class="verify-icon">
        <el-icon :size="60" color="#4A90E2"><Message /></el-icon>
      </div>
      
      <h2 class="verify-title">邮箱验证</h2>
      
      <p class="verify-desc">
        验证码已发送至 <span class="email">{{ email }}</span>
        <br>请输入您收到的 6 位数字验证码
      </p>
      
      <div class="code-inputs">
        <el-input
          v-for="(digit, index) in 6"
          :key="index"
          v-model="codeDigits[index]"
          maxlength="1"
          :ref="el => { if (el) inputRefs[index] = el }"
          @input="handleInput(index)"
          @keydown.delete="handleDelete(index)"
          @focus="handleFocus(index)"
          class="code-input"
        />
      </div>
      
      <div class="resend">
        <el-button 
          type="text" 
          :disabled="countdown > 0"
          @click="handleResend"
        >
          {{ countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送' }}
        </el-button>
      </div>
      
      <el-button 
        type="primary"
        class="verify-btn"
        :loading="loading"
        @click="handleVerify"
      >
        验证
      </el-button>
      
      <div class="back-link">
        <router-link to="/auth">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const countdown = ref(0)
const countdownTimer = ref(null)
const codeDigits = ref(['', '', '', '', '', ''])
const inputRefs = ref([])

// 获取邮箱地址
const email = computed(() => route.query.email || '未知邮箱')

// 合并验证码
const verificationCode = computed(() => codeDigits.value.join(''))

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  countdownTimer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer.value)
    }
  }, 1000)
}

// 处理重新发送
const handleResend = () => {
  // 在实际应用中，这里应该调用API重新发送验证码
  ElMessage({
    type: 'success',
    message: '验证码已重新发送'
  })
  
  startCountdown()
}

// 处理验证码输入
const handleInput = (index) => {
  // 自动移动到下一个输入框
  if (codeDigits.value[index] && index < 5) {
    inputRefs.value[index + 1].focus()
  }
}

// 处理删除键
const handleDelete = (index) => {
  if (!codeDigits.value[index] && index > 0) {
    codeDigits.value[index - 1] = ''
    inputRefs.value[index - 1].focus()
  }
}

// 处理聚焦
const handleFocus = (index) => {
  // 全选当前内容
  setTimeout(() => {
    inputRefs.value[index].select()
  }, 0)
}

// 验证处理
const handleVerify = () => {
  if (verificationCode.value.length !== 6) {
    ElMessage({
      type: 'warning',
      message: '请输入完整的验证码'
    })
    return
  }
  
  loading.value = true
  
  // 模拟验证过程
  setTimeout(() => {
    // 在实际应用中，这里应该调用API验证
    if (verificationCode.value === '123456') { // 假设正确验证码是123456
      ElMessage({
        type: 'success',
        message: '验证成功！'
      })
      router.push('/auth')
    } else {
      ElMessage({
        type: 'error',
        message: '验证码错误，请重试'
      })
      codeDigits.value = ['', '', '', '', '', '']
      inputRefs.value[0]?.focus()
    }
    
    loading.value = false
  }, 1000)
}

// 生命周期钩子
onMounted(() => {
  startCountdown()
  
  // 自动聚焦第一个输入框
  setTimeout(() => {
    inputRefs.value[0]?.focus()
  }, 200)
})

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})
</script>

<style scoped>
.verify-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 20px;
}

.verify-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  padding: 30px;
  text-align: center;
}

.logo {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

.logo a {
  color: var(--primary-color);
  text-decoration: none;
}

.verify-icon {
  margin: 20px 0;
}

.verify-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.verify-desc {
  color: var(--text-secondary);
  margin-bottom: 30px;
  line-height: 1.6;
}

.email {
  color: var(--primary-color);
  font-weight: 500;
}

.code-inputs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.code-input {
  width: 40px;
  max-width: 40px;
  text-align: center;
}

:deep(.el-input__inner) {
  text-align: center;
  font-size: 20px;
  padding: 0;
}

.resend {
  margin-bottom: 24px;
}

.verify-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  margin-bottom: 16px;
}

.back-link {
  margin-top: 16px;
}

.back-link a {
  color: var(--text-secondary);
  text-decoration: none;
}

.back-link a:hover {
  color: var(--primary-color);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .verify-card {
    padding: 20px;
  }
  
  .code-input {
    width: 36px;
    max-width: 36px;
  }
}
</style> 