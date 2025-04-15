<template>
  <div class="appeal-page">
    <div class="container">
      <div class="appeal-card">
        <div class="ban-notice">
          <i class="el-icon-warning-outline warning-icon"></i>
          <h2>Your account has been restricted</h2>
          
          <div class="ban-reason" v-if="banReason">
            <h3>Reason for restriction:</h3>
            <p>{{ banReason }}</p>
          </div>
          
          <div class="ban-date">
            <p>Restriction date: {{ banDate }}</p>
          </div>
        </div>
        
        <div class="appeal-form">
          <h3>Appeal Form</h3>
          <el-form 
            :model="appealForm" 
            :rules="rules" 
            ref="appealFormRef"
            label-width="100px"
          >
            <el-form-item label="Reason" prop="reason">
              <el-input 
                type="textarea" 
                v-model="appealForm.reason"
                :rows="6"
                placeholder="Please explain your appeal reason in detail..."
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitAppeal" :loading="submitting">Submit Appeal</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- Success notification -->
        <el-dialog
          v-model="successDialogVisible"
          title="Appeal Submitted"
          width="400px"
        >
          <div class="success-dialog">
            <i class="el-icon-success success-icon"></i>
            <p>Your appeal has been successfully submitted. We will review it within 3 business days.</p>
            <p>Please check your email or system notifications for updates.</p>
          </div>
          <template #footer>
            <el-button type="primary" @click="successDialogVisible = false">OK</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Appeal',
  setup() {
    const appealFormRef = ref(null)
    const submitting = ref(false)
    const successDialogVisible = ref(false)
    const banReason = ref('')
    const banDate = ref('')
    
    const appealForm = reactive({
      reason: ''
    })
    
    const rules = {
      reason: [
        { required: true, message: 'Please fill in the appeal reason', trigger: 'blur' },
        { min: 20, message: 'Appeal reason must be at least 20 characters', trigger: 'blur' }
      ]
    }
    
    onMounted(() => {
      // Simulate getting ban reason and time
      setTimeout(() => {
        banReason.value = 'Violation of community rules: posted inappropriate content'
        banDate.value = '2023-04-01 10:30:45'
      }, 500)
    })
    
    const submitAppeal = async () => {
      if (!appealFormRef.value) return
      
      await appealFormRef.value.validate((valid) => {
        if (valid) {
          submitting.value = true
          
          // Simulate API request
          setTimeout(() => {
            submitting.value = false
            successDialogVisible.value = true
          }, 1000)
        } else {
          ElMessage.warning('Please fill in the appeal reason correctly')
        }
      })
    }
    
    return {
      appealFormRef,
      appealForm,
      rules,
      submitting,
      submitAppeal,
      successDialogVisible,
      banReason,
      banDate
    }
  }
}
</script>

<style scoped>
.appeal-page {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.container {
  width: 100%;
  max-width: 600px;
}

.appeal-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.ban-notice {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.warning-icon {
  font-size: 48px;
  color: #e6a23c;
  margin-bottom: 15px;
}

.ban-notice h2 {
  color: #f56c6c;
  margin-bottom: 15px;
  font-size: 22px;
}

.ban-reason {
  margin: 20px 0;
  text-align: left;
  background: #fdf6ec;
  padding: 15px;
  border-radius: 4px;
}

.ban-reason h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #606266;
}

.ban-date {
  margin-top: 15px;
  color: #909399;
  font-size: 14px;
}

.appeal-form {
  margin-top: 30px;
}

.appeal-form h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #303133;
}

.success-dialog {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 20px;
}
</style> 