<template>
  <div class="feedback-page">
    <div class="container">
      <h1 class="page-title">意见反馈</h1>
      
      <div class="feedback-card">
        <el-form 
          :model="feedbackForm" 
          :rules="rules" 
          ref="feedbackFormRef"
          label-width="100px"
        >
          <el-form-item label="反馈类型" prop="type">
            <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
              <el-option label="功能建议" value="suggestion"></el-option>
              <el-option label="Bug报告" value="bug"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="反馈内容" prop="content">
            <el-input 
              type="textarea" 
              v-model="feedbackForm.content"
              :rows="6"
              placeholder="请详细描述您的反馈内容..."
            ></el-input>
          </el-form-item>
          
          <el-form-item label="联系方式" prop="contact">
            <el-input 
              v-model="feedbackForm.contact"
              placeholder="可选，您希望我们如何与您联系（电话/邮箱等）"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitFeedback" :loading="submitting">提交反馈</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 提交成功反馈 -->
      <el-dialog
        v-model="successDialogVisible"
        title="反馈提交成功"
        width="400px"
      >
        <div class="success-dialog">
          <i class="el-icon-success success-icon"></i>
          <p>感谢您的反馈，我们会尽快处理！</p>
        </div>
        <template #footer>
          <el-button type="primary" @click="closeSuccessDialog">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Feedback',
  setup() {
    const feedbackFormRef = ref(null)
    const submitting = ref(false)
    const successDialogVisible = ref(false)
    
    const feedbackForm = reactive({
      type: '',
      content: '',
      contact: ''
    })
    
    const rules = {
      type: [
        { required: true, message: '请选择反馈类型', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请填写反馈内容', trigger: 'blur' },
        { min: 10, message: '反馈内容至少10个字符', trigger: 'blur' }
      ]
    }
    
    const submitFeedback = async () => {
      if (!feedbackFormRef.value) return
      
      await feedbackFormRef.value.validate((valid) => {
        if (valid) {
          submitting.value = true
          
          // 模拟API请求
          setTimeout(() => {
            submitting.value = false
            successDialogVisible.value = true
          }, 1000)
        } else {
          ElMessage.warning('请正确填写表单内容')
        }
      })
    }
    
    const closeSuccessDialog = () => {
      successDialogVisible.value = false
      // 重置表单
      feedbackForm.type = ''
      feedbackForm.content = ''
      feedbackForm.contact = ''
    }
    
    return {
      feedbackFormRef,
      feedbackForm,
      rules,
      submitting,
      submitFeedback,
      successDialogVisible,
      closeSuccessDialog
    }
  }
}
</script>

<style scoped>
.feedback-page {
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
  font-weight: 500;
}

.feedback-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
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