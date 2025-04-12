<template>
  <MainLayout>
    <div class="log-detail-page">
      <!-- 顶部操作栏 -->
      <div class="action-bar">
        <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
        
        <div class="right-actions" v-if="!loading && log">
          <!-- 用户可以编辑和删除自己的日志 -->
          <el-button type="primary" plain @click="editLog">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button type="danger" plain @click="confirmDelete">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
          
          <!-- 管理员可以标记违规 -->
          <el-button 
            v-if="userStore.isAdmin && log.status !== 'rejected'" 
            type="warning" 
            plain 
            @click="rejectDialog.visible = true"
          >
            <el-icon><Warning /></el-icon> 标记违规
          </el-button>
        </div>
      </div>
      
      <!-- 加载中 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="15" animated />
      </div>
      
      <!-- 主要内容 -->
      <template v-else-if="log">
        <!-- 日志状态提示 -->
        <el-alert
          v-if="log.status === 'pending'"
          title="此日志正在审核中，审核通过后将对其他用户可见"
          type="warning"
          show-icon
          :closable="false"
          class="status-alert"
        />
        
        <el-alert
          v-if="log.status === 'rejected'"
          :title="`此日志未通过审核: ${log.rejectReason || '违反平台规定'}`"
          type="error"
          show-icon
          :closable="false"
          class="status-alert"
        />
        
        <!-- 日志头部信息 -->
        <div class="log-header">
          <h1 class="log-title">{{ log.title }}</h1>
          
          <div class="log-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon> 
              作者: {{ log.author }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              阅读日期: {{ log.date }}
            </span>
            <span class="meta-item">
              <el-icon><Timer /></el-icon>
              阅读时长: {{ log.duration }} 分钟
            </span>
            <span class="meta-item">
              <el-icon><InfoFilled /></el-icon>
              状态: 
              <el-tag :type="getStatusType(log.status)" size="small">
                {{ getStatusText(log.status) }}
              </el-tag>
            </span>
          </div>
        </div>
        
        <!-- 日志内容 -->
        <el-card class="log-content-card" shadow="hover">
          <div class="log-content" v-html="formattedContent"></div>
        </el-card>
      </template>
      
      <!-- 数据不存在 -->
      <el-empty 
        v-else 
        description="找不到该阅读日志" 
        class="empty-container"
      >
        <el-button type="primary" @click="goBack">返回日志列表</el-button>
      </el-empty>
    </div>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialog.visible"
      title="确认删除"
      width="30%"
      :close-on-click-modal="false"
    >
      <span>确定要删除这篇阅读日志吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialog.visible = false">取消</el-button>
          <el-button type="danger" @click="deleteLog" :loading="deleteDialog.loading">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 标记违规对话框 -->
    <el-dialog
      v-model="rejectDialog.visible"
      title="标记违规"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectDialog.form" label-width="100px">
        <el-form-item label="违规原因" required>
          <el-select v-model="rejectDialog.form.reason" placeholder="请选择违规原因" style="width: 100%">
            <el-option label="内容不符合平台规范" value="内容不符合平台规范" />
            <el-option label="包含敏感内容" value="包含敏感内容" />
            <el-option label="涉嫌抄袭/侵权" value="涉嫌抄袭/侵权" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="详细说明">
          <el-input 
            v-model="rejectDialog.form.detail" 
            type="textarea" 
            rows="4" 
            placeholder="请输入详细说明（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialog.visible = false">取消</el-button>
          <el-button 
            type="danger" 
            @click="rejectLog"
            :loading="rejectDialog.loading"
          >
            确认标记违规
          </el-button>
        </span>
      </template>
    </el-dialog>
  </MainLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLogStore } from '../store/log'
import { useUserStore } from '../store/user'
import MainLayout from '../layouts/MainLayout.vue'
import { ArrowLeft, Edit, Delete, User, Calendar, Timer, Warning, InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const logStore = useLogStore()
const userStore = useUserStore()

// 状态
const loading = ref(true)
const log = ref(null)

// 删除对话框
const deleteDialog = reactive({
  visible: false,
  loading: false
})

// 标记违规对话框
const rejectDialog = reactive({
  visible: false,
  loading: false,
  form: {
    reason: '',
    detail: ''
  }
})

// 计算属性 - 格式化内容（处理换行符）
const formattedContent = computed(() => {
  if (!log.value || !log.value.content) return ''
  
  // 将换行符转换为 <br>
  return log.value.content.replace(/\n/g, '<br>')
})

// 获取状态显示类型
const getStatusType = (status) => {
  const map = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态显示文本
const getStatusText = (status) => {
  const map = {
    approved: '已通过',
    pending: '审核中',
    rejected: '未通过'
  }
  return map[status] || '未知'
}

// 返回上一页
const goBack = () => {
  router.push('/logs')
}

// 编辑日志
const editLog = () => {
  router.push(`/logs/edit/${route.params.id}`)
}

// 确认删除
const confirmDelete = () => {
  deleteDialog.visible = true
}

// 删除日志
const deleteLog = async () => {
  try {
    deleteDialog.loading = true
    await logStore.deleteLog(route.params.id)
    
    ElMessage({
      type: 'success',
      message: '日志删除成功'
    })
    
    router.push('/logs')
  } catch (error) {
    ElMessage.error('删除失败，请稍后再试')
    console.error(error)
  } finally {
    deleteDialog.loading = false
    deleteDialog.visible = false
  }
}

// 标记违规
const rejectLog = async () => {
  if (!rejectDialog.form.reason) {
    ElMessage.warning('请选择违规原因')
    return
  }
  
  try {
    rejectDialog.loading = true
    
    // 构建完整的违规原因
    const rejectReason = rejectDialog.form.detail
      ? `${rejectDialog.form.reason}: ${rejectDialog.form.detail}`
      : rejectDialog.form.reason
    
    // 更新日志状态
    await logStore.updateLog(route.params.id, {
      status: 'rejected',
      rejectReason
    })
    
    // 重新获取日志详情
    await fetchLogDetail()
    
    ElMessage({
      type: 'success',
      message: '已标记为违规内容'
    })
    
    rejectDialog.visible = false
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试')
    console.error(error)
  } finally {
    rejectDialog.loading = false
  }
}

// 获取日志详情
const fetchLogDetail = async () => {
  loading.value = true
  
  try {
    const result = await logStore.fetchLogDetail(route.params.id)
    log.value = result
  } catch (error) {
    ElMessage.error('获取日志详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchLogDetail()
})
</script>

<style scoped>
.log-detail-page {
  padding-bottom: 40px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px 0;
}

.status-alert {
  margin-bottom: 20px;
}

.log-header {
  margin-bottom: 24px;
}

.log-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.log-content-card {
  margin-bottom: 30px;
}

.log-content {
  padding: 10px;
  min-height: 200px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.empty-container {
  padding: 60px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    gap: 15px;
  }
  
  .right-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .log-meta {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 