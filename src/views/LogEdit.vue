<template>
  <MainLayout>
    <div class="log-edit-page">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? '编辑阅读日志' : '新增阅读日志' }}</h1>
        <p class="page-description">
          {{ isEdit ? '修改您的阅读记录和笔记' : '记录您的阅读感悟和心得' }}
        </p>
      </div>
      
      <!-- 编辑表单 -->
      <el-card shadow="never" class="edit-form-card">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>
        
        <el-form
          v-else
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="书籍标题" prop="title">
            <el-input 
              v-model="form.title" 
              placeholder="请输入您阅读的书籍标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="作者" prop="author">
            <el-input 
              v-model="form.author" 
              placeholder="请输入书籍作者"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="阅读日期" prop="date">
                <el-date-picker
                  v-model="form.date"
                  type="date"
                  placeholder="选择阅读日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  :disabled-date="disableFutureDates"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="阅读时长 (分钟)" prop="duration">
                <el-input-number
                  v-model="form.duration"
                  :min="1"
                  :max="1440"
                  :step="5"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="阅读笔记与心得" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              placeholder="请输入您的阅读笔记、心得体会..."
              :rows="12"
              maxlength="5000"
              show-word-limit
            />
          </el-form-item>
          
          <div class="form-actions">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              {{ isEdit ? '保存修改' : '提交日志' }}
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
    
    <!-- 提交确认对话框 -->
    <el-dialog
      v-model="confirmDialog.visible"
      :title="isEdit ? '确认修改' : '确认提交'"
      width="30%"
    >
      <p>{{ isEdit ? '确定要保存对日志的修改吗？' : '确定要提交这篇阅读日志吗？' }}</p>
      <p v-if="!isEdit" class="dialog-tip">提交后将等待审核，审核通过后方可公开展示。</p>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDialog.visible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitForm"
            :loading="submitting"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLogStore } from '../store/log'
import MainLayout from '../layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const logStore = useLogStore()
const formRef = ref(null)

// 状态
const loading = ref(false)
const submitting = ref(false)
const confirmDialog = reactive({
  visible: false
})

// 表单数据
const form = reactive({
  title: '',
  author: '',
  date: new Date().toISOString().split('T')[0], // 默认今天
  duration: 60, // 默认60分钟
  content: ''
})

// 校验规则
const rules = {
  title: [
    { required: true, message: '请输入书籍标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入书籍作者', trigger: 'blur' },
    { min: 2, max: 50, message: '作者名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择阅读日期', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入阅读时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '时长必须大于0', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入阅读笔记与心得', trigger: 'blur' },
    { min: 10, max: 5000, message: '内容长度在 10 到 5000 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const isEdit = computed(() => {
  return route.name === 'LogEdit'
})

const logId = computed(() => {
  return route.params.id
})

// 禁用未来日期
const disableFutureDates = (time) => {
  return time.getTime() > Date.now()
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      confirmDialog.visible = true
    }
  })
}

// 确认提交
const submitForm = async () => {
  try {
    submitting.value = true
    
    if (isEdit.value) {
      // 编辑模式 - 更新日志
      await logStore.updateLog(logId.value, { ...form })
      
      ElMessage({
        type: 'success',
        message: '日志更新成功'
      })
      
      router.push(`/logs/${logId.value}`)
    } else {
      // 新增模式 - 创建日志
      const newLog = await logStore.createLog({ ...form })
      
      ElMessage({
        type: 'success',
        message: '日志创建成功，等待审核'
      })
      
      router.push(`/logs/${newLog.id}`)
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败，请稍后再试' : '创建失败，请稍后再试')
    console.error(error)
  } finally {
    submitting.value = false
    confirmDialog.visible = false
  }
}

// 获取日志详情（编辑模式）
const fetchLogDetail = async () => {
  if (!isEdit.value || !logId.value) return
  
  loading.value = true
  
  try {
    const log = await logStore.fetchLogDetail(logId.value)
    
    // 填充表单
    form.title = log.title
    form.author = log.author
    form.date = log.date
    form.duration = log.duration
    form.content = log.content
  } catch (error) {
    ElMessage.error('获取日志详情失败')
    console.error(error)
    router.push('/logs')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    fetchLogDetail()
  }
})
</script>

<style scoped>
.log-edit-page {
  padding-bottom: 40px;
}

.edit-form-card {
  margin-bottom: 30px;
}

.loading-container {
  padding: 20px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-tip {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-row {
    display: block;
  }
  
  .el-col {
    width: 100% !important;
  }
}
</style> 