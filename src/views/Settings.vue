<template>
  <div class="settings-page">
    <div class="container">
      <h1 class="page-title">设置</h1>
      
      <div class="settings-wrapper">
        <!-- 左侧菜单 -->
        <div class="settings-menu">
          <div 
            v-for="(item, index) in menuItems" 
            :key="index"
            :class="['menu-item', activeTab === item.key ? 'active' : '']"
            @click="activeTab = item.key"
          >
            {{ item.label }}
          </div>
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="settings-content">
          <!-- 修改头像 -->
          <div v-if="activeTab === 'avatar'" class="tab-content">
            <h2>修改头像</h2>
            <div class="avatar-wrapper">
              <div class="current-avatar">
                <img :src="currentAvatar || '/default-avatar.png'" alt="用户头像" />
              </div>
              <div class="upload-area">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarChange"
                >
                  <el-button type="primary">选择图片</el-button>
                </el-upload>
                <p class="tip">支持jpg、png格式，文件小于2MB</p>
              </div>
            </div>
            <el-button type="primary" :disabled="!newAvatar" @click="saveAvatar">保存头像</el-button>
          </div>
          
          <!-- 修改密码 -->
          <div v-if="activeTab === 'password'" class="tab-content">
            <h2>修改密码</h2>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="savePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 修改邮箱 -->
          <div v-if="activeTab === 'email'" class="tab-content">
            <h2>修改邮箱</h2>
            <p class="current-email">当前邮箱：{{ userEmail }}</p>
            <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
              <el-form-item label="新邮箱" prop="newEmail">
                <el-input v-model="emailForm.newEmail"></el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="verifyCode">
                <div class="verify-code-wrapper">
                  <el-input v-model="emailForm.verifyCode"></el-input>
                  <el-button 
                    :disabled="countDown > 0" 
                    @click="sendVerifyCode"
                  >
                    {{ countDown > 0 ? `${countDown}秒后重发` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveEmail">修改邮箱</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 账号安全 -->
          <div v-if="activeTab === 'security'" class="tab-content">
            <h2>账号安全</h2>
            <div class="security-wrapper">
              <p class="warning">
                <i class="el-icon-warning"></i>
                账号注销后，所有数据将被永久删除且无法恢复，请谨慎操作
              </p>
              <el-button type="danger" @click="showDeleteConfirm">注销账号</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 注销账号确认对话框 -->
    <el-dialog
      title="注销账号确认"
      v-model="deleteDialogVisible"
      width="400px"
    >
      <div class="delete-confirm">
        <p class="warning-text">
          账号注销后，您的所有数据将被永久删除且无法恢复。
          请确认该操作：
        </p>
        <el-input
          type="password"
          v-model="deleteConfirmPassword"
          placeholder="请输入密码确认"
        ></el-input>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteAccount">确认注销</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Settings',
  setup() {
    // 菜单标签页
    const activeTab = ref('avatar')
    const menuItems = [
      { key: 'avatar', label: '修改头像' },
      { key: 'password', label: '修改密码' },
      { key: 'email', label: '修改邮箱' },
      { key: 'security', label: '账号安全' },
    ]
    
    // 用户数据
    const userEmail = ref('user@example.com')
    const currentAvatar = ref('')
    const newAvatar = ref(null)
    
    // 修改密码表单
    const passwordFormRef = ref(null)
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ]
    }
    
    // 修改邮箱表单
    const emailFormRef = ref(null)
    const emailForm = reactive({
      newEmail: '',
      verifyCode: ''
    })
    const emailRules = {
      newEmail: [
        { required: true, message: '请输入新邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      verifyCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码是6位数字', trigger: 'blur' }
      ]
    }
    
    // 验证码倒计时
    const countDown = ref(0)
    
    // 注销账号相关
    const deleteDialogVisible = ref(false)
    const deleteConfirmPassword = ref('')
    
    // 初始化用户数据
    onMounted(() => {
      // 模拟从API获取数据
      setTimeout(() => {
        userEmail.value = 'user@example.com'
        currentAvatar.value = '/default-avatar.png'
      }, 500)
    })
    
    // 头像处理
    const handleAvatarChange = (file) => {
      newAvatar.value = file.raw
      // 预览图片
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = () => {
        currentAvatar.value = reader.result
      }
    }
    
    const saveAvatar = () => {
      if (!newAvatar.value) {
        ElMessage.warning('请先选择图片')
        return
      }
      
      // 模拟上传
      setTimeout(() => {
        ElMessage.success('头像更新成功')
        newAvatar.value = null
      }, 1000)
    }
    
    // 密码处理
    const savePassword = async () => {
      if (!passwordFormRef.value) return
      
      await passwordFormRef.value.validate((valid) => {
        if (valid) {
          // 模拟API请求
          setTimeout(() => {
            ElMessage.success('密码修改成功')
            passwordForm.oldPassword = ''
            passwordForm.newPassword = ''
            passwordForm.confirmPassword = ''
          }, 1000)
        }
      })
    }
    
    // 邮箱处理
    const sendVerifyCode = () => {
      if (!emailForm.newEmail) {
        ElMessage.warning('请先输入新邮箱')
        return
      }
      
      // 模拟发送验证码
      countDown.value = 60
      const timer = setInterval(() => {
        countDown.value--
        if (countDown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      
      ElMessage.success(`验证码已发送至 ${emailForm.newEmail}`)
    }
    
    const saveEmail = async () => {
      if (!emailFormRef.value) return
      
      await emailFormRef.value.validate((valid) => {
        if (valid) {
          // 模拟API请求
          setTimeout(() => {
            userEmail.value = emailForm.newEmail
            ElMessage.success('邮箱修改成功')
            emailForm.newEmail = ''
            emailForm.verifyCode = ''
          }, 1000)
        }
      })
    }
    
    // 账号注销
    const showDeleteConfirm = () => {
      deleteDialogVisible.value = true
    }
    
    const confirmDeleteAccount = () => {
      if (!deleteConfirmPassword.value) {
        ElMessage.warning('请输入密码确认')
        return
      }
      
      // 模拟API请求
      setTimeout(() => {
        deleteDialogVisible.value = false
        deleteConfirmPassword.value = ''
        
        ElMessageBox.alert('账号已成功注销，即将退出登录', '操作成功', {
          confirmButtonText: '确定',
          callback: () => {
            // 清除本地存储并跳转
            localStorage.removeItem('token')
            localStorage.removeItem('userRole')
            window.location.href = '/'
          }
        })
      }, 1000)
    }
    
    return {
      // 菜单相关
      activeTab,
      menuItems,
      
      // 用户数据
      userEmail,
      currentAvatar,
      newAvatar,
      
      // 头像相关
      handleAvatarChange,
      saveAvatar,
      
      // 密码相关
      passwordFormRef,
      passwordForm,
      passwordRules,
      savePassword,
      
      // 邮箱相关
      emailFormRef,
      emailForm,
      emailRules,
      countDown,
      sendVerifyCode,
      saveEmail,
      
      // 账号注销相关
      deleteDialogVisible,
      deleteConfirmPassword,
      showDeleteConfirm,
      confirmDeleteAccount
    }
  }
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
  font-weight: 500;
}

.settings-wrapper {
  display: flex;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧菜单 */
.settings-menu {
  width: 200px;
  background: #f5f7fa;
  padding: 20px 0;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
}

.menu-item:hover {
  background: #e6f1fc;
  color: #409eff;
}

.menu-item.active {
  background: #e6f1fc;
  color: #409eff;
  font-weight: 500;
  border-right: 3px solid #409eff;
}

/* 右侧内容 */
.settings-content {
  flex: 1;
  padding: 20px 30px;
}

.tab-content {
  min-height: 400px;
}

.tab-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
}

/* 头像上传 */
.avatar-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.current-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.current-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-area {
  flex: 1;
}

.tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 邮箱验证码 */
.current-email {
  margin-bottom: 20px;
  color: #606266;
}

.verify-code-wrapper {
  display: flex;
}

.verify-code-wrapper .el-input {
  margin-right: 10px;
}

/* 账号安全 */
.security-wrapper {
  padding: 20px;
  background: #f8f8f8;
  border-radius: 4px;
}

.warning {
  color: #e6a23c;
  margin-bottom: 20px;
}

.warning i {
  margin-right: 5px;
}

/* 注销确认 */
.delete-confirm .warning-text {
  color: #f56c6c;
  margin-bottom: 15px;
}
</style> 