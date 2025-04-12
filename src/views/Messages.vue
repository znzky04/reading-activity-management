<template>
  <MainLayout>
    <div class="messages-page">
      <div class="page-header">
        <h1 class="page-title">消息中心</h1>
        <p class="page-description">查看您的所有通知和消息</p>
      </div>
      
      <!-- 消息列表 -->
      <el-row :gutter="20">
        <!-- 左侧消息类型 -->
        <el-col :span="6" class="message-types-col">
          <el-card shadow="never" class="message-types-card">
            <template #header>
              <div class="card-header">
                <h3 class="card-title">消息类型</h3>
              </div>
            </template>
            
            <el-menu
              :default-active="activeType"
              class="message-types-menu"
              @select="handleTypeSelect"
            >
              <el-menu-item index="all">
                <el-icon><Message /></el-icon>
                <span>全部消息</span>
                <el-badge :value="unreadCounts.all || ''" class="message-badge" />
              </el-menu-item>
              <el-menu-item index="system">
                <el-icon><Bell /></el-icon>
                <span>系统通知</span>
                <el-badge :value="unreadCounts.system || ''" class="message-badge" />
              </el-menu-item>
              <el-menu-item index="audit">
                <el-icon><InfoFilled /></el-icon>
                <span>审核通知</span>
                <el-badge :value="unreadCounts.audit || ''" class="message-badge" />
              </el-menu-item>
              <el-menu-item index="settings">
                <el-icon><Setting /></el-icon>
                <span>设置通知</span>
                <el-badge :value="unreadCounts.settings || ''" class="message-badge" />
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        
        <!-- 右侧消息列表 -->
        <el-col :span="18" class="message-list-col">
          <el-card shadow="never" class="message-list-card">
            <template #header>
              <div class="card-header">
                <h3 class="card-title">{{ getTypeTitle(activeType) }}</h3>
                <div class="header-actions">
                  <el-button type="primary" plain size="small" @click="markAllAsRead" :disabled="!hasUnread">
                    全部标为已读
                  </el-button>
                </div>
              </div>
            </template>
            
            <div v-if="loading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div v-else-if="filteredMessages.length === 0" class="empty-messages">
              <el-empty description="暂无消息" />
            </div>
            
            <div v-else class="message-list">
              <div 
                v-for="message in filteredMessages" 
                :key="message.id"
                :class="['message-item', { unread: !message.read }]"
                @click="viewMessage(message)"
              >
                <el-badge :is-dot="!message.read" class="message-status" />
                
                <div class="message-icon">
                  <el-icon v-if="message.type === 'system'" class="icon-type system"><Bell /></el-icon>
                  <el-icon v-else-if="message.type === 'audit'" class="icon-type audit"><InfoFilled /></el-icon>
                  <el-icon v-else-if="message.type === 'settings'" class="icon-type settings"><Setting /></el-icon>
                </div>
                
                <div class="message-content">
                  <div class="message-title">{{ message.title }}</div>
                  <div class="message-preview">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
              </div>
              
              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  layout="prev, pager, next"
                  :total="totalMessages"
                  :page-size="pageSize"
                  :current-page="currentPage"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="messageDialog.visible"
      :title="messageDialog.message?.title || '消息详情'"
      width="40%"
    >
      <div v-if="messageDialog.message" class="message-detail">
        <div class="message-detail-meta">
          <span class="detail-type">
            <el-tag :type="getTagType(messageDialog.message.type)" size="small">
              {{ getTypeText(messageDialog.message.type) }}
            </el-tag>
          </span>
          <span class="detail-time">{{ formatTime(messageDialog.message.time) }}</span>
        </div>
        
        <div class="message-detail-content">
          {{ messageDialog.message.content }}
        </div>
        
        <div v-if="messageDialog.message.action" class="message-action">
          <el-button 
            type="primary" 
            size="small"
            @click="handleMessageAction(messageDialog.message)"
          >
            {{ messageDialog.message.actionText || '查看详情' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </MainLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MainLayout from '../layouts/MainLayout.vue'
import { Message, Bell, InfoFilled, Setting } from '@element-plus/icons-vue'

const router = useRouter()

// 状态
const loading = ref(true)
const activeType = ref('all')
const messages = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalMessages = ref(0)

// 消息详情对话框
const messageDialog = reactive({
  visible: false,
  message: null
})

// 获取模拟消息数据
const fetchMessages = () => {
  loading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    const mockMessages = [
      {
        id: 1,
        type: 'system',
        title: '欢迎使用阅读活动管理系统',
        content: '感谢您使用我们的阅读活动管理系统，这里可以帮助您记录阅读笔记、统计阅读时间、分享阅读体验。',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        read: false
      },
      {
        id: 2,
        type: 'audit',
        title: '您的阅读日志已通过审核',
        content: '您提交的《JavaScript高级程序设计》阅读日志已通过审核，现在可以在您的日志列表中查看。',
        time: new Date(Date.now() - 1000 * 60 * 60 * 12),
        read: false,
        action: 'viewLog',
        actionText: '查看日志',
        actionData: { logId: 1 }
      },
      {
        id: 3,
        type: 'settings',
        title: '账号安全提醒',
        content: '您的账号于今天从新设备登录，如果这不是您本人的操作，请及时修改密码。',
        time: new Date(Date.now() - 1000 * 60 * 30),
        read: true
      },
      {
        id: 4,
        type: 'audit',
        title: '您的阅读日志需要修改',
        content: '您提交的《设计模式》阅读日志未通过审核，原因：内容不符合平台规范，请修改后重新提交。',
        time: new Date(Date.now() - 1000 * 60 * 60 * 5),
        read: false,
        action: 'editLog',
        actionText: '编辑日志',
        actionData: { logId: 2 }
      },
      {
        id: 5, 
        type: 'system',
        title: '系统维护通知',
        content: '系统将于本周日凌晨2点至4点进行例行维护，届时可能无法访问，请提前做好安排。',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true
      }
    ]
    
    messages.value = mockMessages
    totalMessages.value = mockMessages.length
    loading.value = false
  }, 1000)
}

// 计算属性 - 根据类型筛选消息
const filteredMessages = computed(() => {
  if (activeType.value === 'all') {
    return messages.value
  }
  
  return messages.value.filter(msg => msg.type === activeType.value)
})

// 计算属性 - 各类型未读消息数量
const unreadCounts = computed(() => {
  const counts = {
    all: 0,
    system: 0,
    audit: 0,
    settings: 0
  }
  
  messages.value.forEach(msg => {
    if (!msg.read) {
      counts.all++
      counts[msg.type]++
    }
  })
  
  return counts
})

// 计算属性 - 是否有未读消息
const hasUnread = computed(() => {
  return unreadCounts.value.all > 0
})

// 获取消息类型标题
const getTypeTitle = (type) => {
  const titles = {
    all: '全部消息',
    system: '系统通知',
    audit: '审核通知',
    settings: '设置通知'
  }
  return titles[type] || '消息'
}

// 获取消息类型文本
const getTypeText = (type) => {
  const texts = {
    system: '系统',
    audit: '审核',
    settings: '设置'
  }
  return texts[type] || '通知'
}

// 获取消息类型标签样式
const getTagType = (type) => {
  const types = {
    system: 'info',
    audit: 'warning',
    settings: 'success'
  }
  return types[type] || 'info'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  
  const now = new Date()
  const messageTime = new Date(time)
  const diff = (now - messageTime) / 1000 // 秒
  
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`
  } else if (diff < 604800) {
    return `${Math.floor(diff / 86400)}天前`
  } else {
    return messageTime.toLocaleDateString()
  }
}

// 选择消息类型
const handleTypeSelect = (type) => {
  activeType.value = type
  currentPage.value = 1
}

// 查看消息详情
const viewMessage = (message) => {
  // 标记为已读
  if (!message.read) {
    message.read = true
  }
  
  messageDialog.message = message
  messageDialog.visible = true
}

// 标记所有为已读
const markAllAsRead = () => {
  messages.value.forEach(msg => {
    msg.read = true
  })
  
  ElMessage({
    type: 'success',
    message: '已将所有消息标记为已读'
  })
}

// 处理消息动作
const handleMessageAction = (message) => {
  if (!message.action || !message.actionData) return
  
  messageDialog.visible = false
  
  if (message.action === 'viewLog') {
    router.push(`/logs/${message.actionData.logId}`)
  } else if (message.action === 'editLog') {
    router.push(`/logs/edit/${message.actionData.logId}`)
  }
}

// 分页处理
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 初始化
onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
.messages-page {
  padding-bottom: 40px;
}

.message-types-col,
.message-list-col {
  margin-bottom: 20px;
}

.message-types-menu {
  border-right: none;
}

.message-badge {
  margin-left: auto;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.message-item:hover {
  background-color: #f5f7fa;
}

.message-item.unread {
  background-color: rgba(74, 144, 226, 0.05);
}

.message-status {
  position: absolute;
  right: 15px;
  top: 15px;
}

.message-icon {
  margin-right: 15px;
  padding-top: 3px;
}

.icon-type {
  font-size: 20px;
  padding: 8px;
  border-radius: 50%;
  color: white;
}

.icon-type.system {
  background-color: #909399;
}

.icon-type.audit {
  background-color: #E6A23C;
}

.icon-type.settings {
  background-color: #67C23A;
}

.message-content {
  flex: 1;
}

.message-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.message-preview {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-time {
  color: var(--text-light);
  font-size: 12px;
}

.empty-messages {
  padding: 40px 0;
}

.loading-container {
  padding: 20px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 消息详情样式 */
.message-detail-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.detail-time {
  color: var(--text-light);
  font-size: 14px;
}

.message-detail-content {
  padding: 15px 0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-action {
  margin-top: 20px;
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .el-row {
    display: block;
  }
  
  .el-col {
    width: 100% !important;
  }
  
  .message-types-col {
    margin-bottom: 20px;
  }
}
</style> 