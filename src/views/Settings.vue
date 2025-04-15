<template>
  <div class="settings-page">
    <div class="container">
      <h1 class="page-title">Settings</h1>
      
      <div class="settings-wrapper">
        <!-- Left Menu -->
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
        
        <!-- Right Content Area -->
        <div class="settings-content">
          <!-- Change Avatar -->
          <div v-if="activeTab === 'avatar'" class="tab-content">
            <h2>Change Avatar</h2>
            <div class="avatar-wrapper">
              <div class="current-avatar">
                <img :src="currentAvatar || '/default-avatar.png'" alt="User Avatar" />
              </div>
              <div class="upload-area">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarChange"
                >
                  <el-button type="primary">Select Image</el-button>
                </el-upload>
                <p class="tip">Supports jpg, png formats, file size less than 2MB</p>
              </div>
            </div>
            <el-button type="primary" :disabled="!newAvatar" @click="saveAvatar">Save Avatar</el-button>
          </div>
          
          <!-- Change Password -->
          <div v-if="activeTab === 'password'" class="tab-content">
            <h2>Change Password</h2>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
              <el-form-item label="Current Password" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="New Password" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="Confirm Password" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="savePassword">Update Password</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- Change Email -->
          <div v-if="activeTab === 'email'" class="tab-content">
            <h2>Change Email</h2>
            <p class="current-email">Current Email: {{ userEmail }}</p>
            <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
              <el-form-item label="New Email" prop="newEmail">
                <el-input v-model="emailForm.newEmail"></el-input>
              </el-form-item>
              <el-form-item label="Verification Code" prop="verifyCode">
                <div class="verify-code-wrapper">
                  <el-input v-model="emailForm.verifyCode"></el-input>
                  <el-button 
                    :disabled="countDown > 0" 
                    @click="sendVerifyCode"
                  >
                    {{ countDown > 0 ? `Resend in ${countDown}s` : 'Get Code' }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveEmail">Update Email</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- Account Security -->
          <div v-if="activeTab === 'security'" class="tab-content">
            <h2>Account Security</h2>
            <div class="security-wrapper">
              <p class="warning">
                <i class="el-icon-warning"></i>
                After deleting your account, all data will be permanently deleted and cannot be recovered. Please proceed with caution.
              </p>
              <el-button type="danger" @click="showDeleteConfirm">Delete Account</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Account Confirmation Dialog -->
    <el-dialog
      title="Delete Account Confirmation"
      v-model="deleteDialogVisible"
      width="400px"
    >
      <div class="delete-confirm">
        <p class="warning-text">
          After deleting your account, all your data will be permanently deleted and cannot be recovered.
          Please confirm this action:
        </p>
        <el-input
          type="password"
          v-model="deleteConfirmPassword"
          placeholder="Enter your password to confirm"
        ></el-input>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Cancel</el-button>
        <el-button type="danger" @click="confirmDeleteAccount">Confirm Delete</el-button>
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
    // Menu tabs
    const activeTab = ref('avatar')
    const menuItems = [
      { key: 'avatar', label: 'Change Avatar' },
      { key: 'password', label: 'Change Password' },
      { key: 'email', label: 'Change Email' },
      { key: 'security', label: 'Account Security' },
    ]
    
    // User data
    const userEmail = ref('user@example.com')
    const currentAvatar = ref('')
    const newAvatar = ref(null)
    
    // Password form
    const passwordFormRef = ref(null)
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    const passwordRules = {
      oldPassword: [
        { required: true, message: 'Please enter your current password', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: 'Please enter a new password', trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: 'Please confirm your new password', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('Passwords do not match'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ]
    }
    
    // Email form
    const emailFormRef = ref(null)
    const emailForm = reactive({
      newEmail: '',
      verifyCode: ''
    })
    const emailRules = {
      newEmail: [
        { required: true, message: 'Please enter a new email', trigger: 'blur' },
        { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
      ],
      verifyCode: [
        { required: true, message: 'Please enter the verification code', trigger: 'blur' },
        { len: 6, message: 'Verification code must be 6 digits', trigger: 'blur' }
      ]
    }
    
    // Verification code countdown
    const countDown = ref(0)
    
    // Account deletion related
    const deleteDialogVisible = ref(false)
    const deleteConfirmPassword = ref('')
    
    // Initialize user data
    onMounted(() => {
      // Simulate API data fetch
      setTimeout(() => {
        userEmail.value = 'user@example.com'
        currentAvatar.value = '/default-avatar.png'
      }, 500)
    })
    
    // Avatar handling
    const handleAvatarChange = (file) => {
      newAvatar.value = file.raw
      // Preview image
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = () => {
        currentAvatar.value = reader.result
      }
    }
    
    const saveAvatar = () => {
      if (!newAvatar.value) {
        ElMessage.warning('Please select an image first')
        return
      }
      
      // Simulate upload
      setTimeout(() => {
        ElMessage.success('Avatar updated successfully')
        newAvatar.value = null
      }, 1000)
    }
    
    // Password handling
    const savePassword = async () => {
      if (!passwordFormRef.value) return
      
      await passwordFormRef.value.validate((valid) => {
        if (valid) {
          // Simulate API request
          setTimeout(() => {
            ElMessage.success('Password updated successfully')
            passwordForm.oldPassword = ''
            passwordForm.newPassword = ''
            passwordForm.confirmPassword = ''
          }, 1000)
        }
      })
    }
    
    // Email handling
    const sendVerifyCode = () => {
      if (!emailForm.newEmail) {
        ElMessage.warning('Please enter your new email first')
        return
      }
      
      // Simulate sending verification code
      countDown.value = 60
      const timer = setInterval(() => {
        countDown.value--
        if (countDown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      
      ElMessage.success(`Verification code sent to ${emailForm.newEmail}`)
    }
    
    const saveEmail = async () => {
      if (!emailFormRef.value) return
      
      await emailFormRef.value.validate((valid) => {
        if (valid) {
          // Simulate API request
          setTimeout(() => {
            userEmail.value = emailForm.newEmail
            ElMessage.success('Email updated successfully')
            emailForm.newEmail = ''
            emailForm.verifyCode = ''
          }, 1000)
        }
      })
    }
    
    // Account deletion
    const showDeleteConfirm = () => {
      deleteDialogVisible.value = true
    }
    
    const confirmDeleteAccount = () => {
      if (!deleteConfirmPassword.value) {
        ElMessage.warning('Please enter your password to confirm')
        return
      }
      
      // Simulate API request
      setTimeout(() => {
        deleteDialogVisible.value = false
        deleteConfirmPassword.value = ''
        
        ElMessageBox.alert('Your account has been deleted successfully. You will be logged out.', 'Operation Successful', {
          confirmButtonText: 'OK',
          callback: () => {
            // Clear local storage and redirect
            localStorage.removeItem('token')
            localStorage.removeItem('userRole')
            window.location.href = '/'
          }
        })
      }, 1000)
    }
    
    return {
      // Menu related
      activeTab,
      menuItems,
      
      // User data
      userEmail,
      currentAvatar,
      newAvatar,
      
      // Avatar related
      handleAvatarChange,
      saveAvatar,
      
      // Password related
      passwordFormRef,
      passwordForm,
      passwordRules,
      savePassword,
      
      // Email related
      emailFormRef,
      emailForm,
      emailRules,
      countDown,
      sendVerifyCode,
      saveEmail,
      
      // Account deletion related
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

/* Left menu */
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

/* Right content */
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

/* Avatar upload */
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

/* Email verification code */
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

/* Account security */
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

/* Delete confirmation */
.delete-confirm .warning-text {
  color: #f56c6c;
  margin-bottom: 15px;
}
</style> 