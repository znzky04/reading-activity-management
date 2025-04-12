<template>
  <div class="appeal-page">
    <div class="container">
      <div class="appeal-card">
        <div class="ban-notice">
          <i class="el-icon-warning-outline warning-icon"></i>
          <h2>您的账号已被限制访问</h2>
          
          <div class="ban-reason" v-if="banReason">
            <h3>封禁原因：</h3>
            <p>{{ banReason }}</p>
          </div>
          
          <div class="ban-date">
            <p>封禁时间：{{ banDate }}</p>
          </div>
        </div>
        
        <div class="appeal-form">
          <h3>申诉表单</h3>
          <el-form 
            :model="appealForm" 
            :rules="rules" 
            ref="appealFormRef"
            label-width="80px"
          >
            <el-form-item label="申诉理由" prop="reason">
              <el-input 
                type="textarea" 
                v-model="appealForm.reason"
                :rows="6"
                placeholder="请详细说明您的申诉理由..."
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitAppeal" :loading="submitting">提交申诉</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 提交成功通知 -->
        <el-dialog
          v-model="successDialogVisible"
          title="申诉已提交"
          width="400px"
        >
          <div class="success-dialog">
            <i class="el-icon-success success-icon"></i>
            <p>您的申诉已成功提交，我们会在3个工作日内审核并回复。</p>
            <p>请留意您的注册邮箱或系统消息通知。</p>
          </div>
          <template #footer>
            <el-button type="primary" @click="successDialogVisible = false">确定</el-button>
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
        { required: true, message: '请填写申诉理由', trigger: 'blur' },
        { min: 20, message: '申诉理由至少20个字符', trigger: 'blur' }
      ]
    }
    
    onMounted(() => {
      // 模拟获取封禁原因和时间
      setTimeout(() => {
        banReason.value = '违反社区规范：发布了不适当的内容'
        banDate.value = '2023-04-01 10:30:45'
      }, 500)
    })
    
    const submitAppeal = async () => {
      if (!appealFormRef.value) return
      
      await appealFormRef.value.validate((valid) => {
        if (valid) {
          submitting.value = true
          
          // 模拟API请求
          setTimeout(() => {
            submitting.value = false
            successDialogVisible.value = true
          }, 1000)
        } else {
          ElMessage.warning('请正确填写申诉理由')
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