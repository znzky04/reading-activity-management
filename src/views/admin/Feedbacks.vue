<template>
  <div class="admin-feedbacks">
    <div class="container">
      <h1 class="page-title">用户反馈管理</h1>
      
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-select 
          v-model="statusFilter" 
          placeholder="处理状态" 
          @change="handleFilterChange"
          class="status-filter"
        >
          <el-option label="全部" value="all"></el-option>
          <el-option label="待处理" value="pending"></el-option>
          <el-option label="已回复" value="replied"></el-option>
        </el-select>
        
        <el-select 
          v-model="typeFilter" 
          placeholder="反馈类型" 
          @change="handleFilterChange"
          class="type-filter"
        >
          <el-option label="全部" value="all"></el-option>
          <el-option label="功能建议" value="suggestion"></el-option>
          <el-option label="Bug报告" value="bug"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
      </div>
      
      <!-- 反馈内容区域 -->
      <div class="feedbacks-container" v-loading="loading">
        <div class="feedbacks-wrapper">
          <!-- 左侧反馈列表 -->
          <div class="feedbacks-list">
            <div 
              v-for="item in feedbacksList" 
              :key="item.id"
              class="feedback-item"
              :class="{
                'feedback-item-active': selectedFeedback && selectedFeedback.id === item.id,
                'feedback-item-replied': item.status === 'replied'
              }"
              @click="selectFeedback(item)"
            >
              <div class="feedback-item-header">
                <el-tag 
                  size="small" 
                  :type="getTypeTag(item.type)"
                >
                  {{ getTypeText(item.type) }}
                </el-tag>
                <el-tag 
                  size="small" 
                  :type="item.status === 'replied' ? 'success' : 'warning'"
                >
                  {{ item.status === 'replied' ? '已回复' : '待处理' }}
                </el-tag>
              </div>
              
              <div class="feedback-item-content">
                <div class="feedback-user-info">
                  <span class="username">{{ item.username }}</span>
                  <span class="date">{{ item.date }}</span>
                </div>
                <div class="feedback-preview">
                  {{ truncateText(item.content, 60) }}
                </div>
              </div>
            </div>
            
            <div v-if="feedbacksList.length === 0" class="empty-data">
              <i class="el-icon-chat-line-square"></i>
              <p>暂无反馈数据</p>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-container" v-if="feedbacksList.length > 0">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalItems"
              >
              </el-pagination>
            </div>
          </div>
          
          <!-- 右侧反馈详情与回复区域 -->
          <div class="feedback-detail" v-if="selectedFeedback">
            <div class="detail-header">
              <h2>用户反馈详情</h2>
              <div class="detail-tags">
                <el-tag :type="getTypeTag(selectedFeedback.type)">
                  {{ getTypeText(selectedFeedback.type) }}
                </el-tag>
                <el-tag 
                  :type="selectedFeedback.status === 'replied' ? 'success' : 'warning'"
                >
                  {{ selectedFeedback.status === 'replied' ? '已回复' : '待处理' }}
                </el-tag>
              </div>
            </div>
            
            <div class="detail-user-info">
              <div class="user-avatar">
                <el-avatar :size="40" :src="selectedFeedback.avatar"></el-avatar>
              </div>
              <div class="user-detail">
                <div class="username">{{ selectedFeedback.username }}</div>
                <div class="date">{{ selectedFeedback.date }}</div>
              </div>
            </div>
            
            <div class="detail-content">
              <h3>反馈内容</h3>
              <div class="content-box">
                {{ selectedFeedback.content }}
              </div>
              
              <div class="contact-info" v-if="selectedFeedback.contact">
                <h3>联系方式</h3>
                <div class="content-box contact-box">
                  {{ selectedFeedback.contact }}
                </div>
              </div>
            </div>
            
            <div class="reply-section">
              <div class="reply-history" v-if="selectedFeedback.reply">
                <h3>回复历史</h3>
                <div class="reply-box">
                  <div class="reply-header">
                    <span class="reply-admin">管理员回复</span>
                    <span class="reply-date">{{ selectedFeedback.replyDate }}</span>
                  </div>
                  <div class="reply-content">
                    {{ selectedFeedback.reply }}
                  </div>
                </div>
              </div>
              
              <div class="reply-form" v-if="selectedFeedback.status !== 'replied'">
                <h3>回复反馈</h3>
                <el-form :model="replyForm" :rules="replyRules" ref="replyFormRef">
                  <el-form-item prop="content">
                    <el-input 
                      type="textarea" 
                      v-model="replyForm.content"
                      :rows="4"
                      placeholder="请输入回复内容..."
                    ></el-input>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="submitReply">发送回复</el-button>
                    <el-button 
                      type="info" 
                      plain 
                      @click="markAsResolved"
                    >
                      标记为已处理（不回复）
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
          
          <div class="feedback-detail empty-detail" v-else>
            <i class="el-icon-chat-dot-square"></i>
            <p>请从左侧选择一条反馈</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminFeedbacks',
  setup() {
    const loading = ref(false)
    
    // 筛选
    const statusFilter = ref('all')
    const typeFilter = ref('all')
    
    // 分页
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalItems = ref(0)
    
    // 反馈列表和选中的反馈
    const feedbacksList = ref([])
    const selectedFeedback = ref(null)
    
    // 回复表单
    const replyFormRef = ref(null)
    const replyForm = reactive({
      content: ''
    })
    const replyRules = {
      content: [
        { required: true, message: '请输入回复内容', trigger: 'blur' },
        { min: 5, message: '回复内容至少5个字符', trigger: 'blur' }
      ]
    }
    
    // 加载反馈列表
    const loadFeedbacksList = () => {
      loading.value = true
      
      // 模拟API请求
      setTimeout(() => {
        // 模拟数据
        const allFeedbacks = [
          {
            id: 1,
            username: '张三',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            date: '2023-04-05 14:30',
            type: 'suggestion',
            content: '建议增加阅读目标和进度追踪功能，可以帮助用户设定月度或年度阅读计划，并通过图表形式展示完成情况。这样能够激励用户坚持阅读，提高平台粘性。',
            contact: 'zhangsan@example.com',
            status: 'pending',
            reply: '',
            replyDate: ''
          },
          {
            id: 2,
            username: '李四',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            date: '2023-04-04 10:15',
            type: 'bug',
            content: '在移动端访问阅读日志详情页面时，图片显示异常，有时会超出屏幕边界导致需要左右滑动查看。此外，在iPhone SE等小屏设备上，文字排版也存在问题，部分内容被遮挡。',
            contact: '13800138000',
            status: 'replied',
            reply: '感谢您的反馈！我们已经记录了这个问题，开发团队会在下一版本中修复移动端适配问题。预计在下周发布的更新中会解决这个问题。如有其他问题，欢迎随时反馈。',
            replyDate: '2023-04-04 15:20'
          },
          {
            id: 3,
            username: '王五',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            date: '2023-04-03 16:45',
            type: 'other',
            content: '我非常喜欢这个阅读平台的设计和功能，使用体验很好。不过我想知道是否计划推出移动App？在手机上使用网页版不太方便，原生App会更好用一些。',
            contact: '',
            status: 'pending',
            reply: '',
            replyDate: ''
          }
        ]
        
        // 根据筛选条件过滤
        let filteredList = [...allFeedbacks]
        
        if (statusFilter.value !== 'all') {
          filteredList = filteredList.filter(item => item.status === statusFilter.value)
        }
        
        if (typeFilter.value !== 'all') {
          filteredList = filteredList.filter(item => item.type === typeFilter.value)
        }
        
        feedbacksList.value = filteredList
        totalItems.value = filteredList.length
        
        // 如果有选中的反馈，更新其数据
        if (selectedFeedback.value) {
          const updated = filteredList.find(item => item.id === selectedFeedback.value.id)
          if (updated) {
            selectedFeedback.value = updated
          } else {
            selectedFeedback.value = null
          }
        }
        
        loading.value = false
      }, 500)
    }
    
    // 初始化
    onMounted(() => {
      loadFeedbacksList()
    })
    
    // 筛选处理
    const handleFilterChange = () => {
      currentPage.value = 1
      loadFeedbacksList()
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      loadFeedbacksList()
    }
    
    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadFeedbacksList()
    }
    
    // 选择反馈
    const selectFeedback = (feedback) => {
      selectedFeedback.value = feedback
      replyForm.content = '' // 清空回复内容
    }
    
    // 提交回复
    const submitReply = async () => {
      if (!replyFormRef.value) return
      
      await replyFormRef.value.validate((valid) => {
        if (valid && selectedFeedback.value) {
          // 模拟API请求
          setTimeout(() => {
            // 更新反馈状态
            const index = feedbacksList.value.findIndex(item => item.id === selectedFeedback.value.id)
            if (index !== -1) {
              feedbacksList.value[index].status = 'replied'
              feedbacksList.value[index].reply = replyForm.content
              feedbacksList.value[index].replyDate = new Date().toLocaleString()
              
              // 更新选中的反馈
              selectedFeedback.value = feedbacksList.value[index]
            }
            
            replyForm.content = ''
            ElMessage.success('回复已发送')
          }, 500)
        }
      })
    }
    
    // 标记为已处理（不回复）
    const markAsResolved = () => {
      if (!selectedFeedback.value) return
      
      ElMessageBox.confirm(
        '确定要将该反馈标记为已处理吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        // 模拟API请求
        setTimeout(() => {
          // 更新反馈状态
          const index = feedbacksList.value.findIndex(item => item.id === selectedFeedback.value.id)
          if (index !== -1) {
            feedbacksList.value[index].status = 'replied'
            feedbacksList.value[index].reply = '【系统自动回复】管理员已处理此反馈。'
            feedbacksList.value[index].replyDate = new Date().toLocaleString()
            
            // 更新选中的反馈
            selectedFeedback.value = feedbacksList.value[index]
          }
          
          ElMessage.success('已标记为已处理')
        }, 500)
      }).catch(() => {})
    }
    
    // 辅助函数
    const truncateText = (text, length) => {
      return text.length > length ? text.substring(0, length) + '...' : text
    }
    
    const getTypeTag = (type) => {
      switch (type) {
        case 'suggestion': return 'success'
        case 'bug': return 'danger'
        case 'other': return 'info'
        default: return 'info'
      }
    }
    
    const getTypeText = (type) => {
      switch (type) {
        case 'suggestion': return '功能建议'
        case 'bug': return 'Bug报告'
        case 'other': return '其他'
        default: return '未知'
      }
    }
    
    return {
      loading,
      statusFilter,
      typeFilter,
      currentPage,
      pageSize,
      totalItems,
      feedbacksList,
      selectedFeedback,
      replyFormRef,
      replyForm,
      replyRules,
      handleFilterChange,
      handleSizeChange,
      handleCurrentChange,
      selectFeedback,
      submitReply,
      markAsResolved,
      truncateText,
      getTypeTag,
      getTypeText
    }
  }
}
</script>

<style scoped>
.admin-feedbacks {
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

/* 筛选区域 */
.filter-section {
  display: flex;
  margin-bottom: 20px;
  gap: 15px;
}

.status-filter,
.type-filter {
  width: 120px;
}

/* 反馈容器 */
.feedbacks-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.feedbacks-wrapper {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

/* 左侧反馈列表 */
.feedbacks-list {
  width: 300px;
  border-right: 1px solid #ebeef5;
  padding-right: 20px;
  overflow-y: auto;
}

.feedback-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.feedback-item:hover {
  background-color: #f5f7fa;
}

.feedback-item-active {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

.feedback-item-replied {
  opacity: 0.8;
}

.feedback-item-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.feedback-user-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 13px;
}

.username {
  font-weight: bold;
  color: #606266;
}

.date {
  color: #909399;
}

.feedback-preview {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.empty-data i {
  font-size: 48px;
  margin-bottom: 10px;
}

.pagination-container {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

/* 右侧反馈详情 */
.feedback-detail {
  flex: 1;
  padding-left: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.detail-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.detail-tags {
  display: flex;
  gap: 10px;
}

.detail-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  margin-right: 15px;
}

.user-detail .username {
  font-size: 15px;
  margin-bottom: 3px;
}

.user-detail .date {
  font-size: 13px;
}

.detail-content {
  margin-bottom: 30px;
}

.detail-content h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
  font-weight: 500;
}

.content-box {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-line;
}

.contact-info {
  margin-top: 15px;
}

.contact-box {
  background: #f0f9eb;
}

/* 回复部分 */
.reply-section {
  margin-top: 30px;
}

.reply-history {
  margin-bottom: 30px;
}

.reply-box {
  background: #ecf5ff;
  padding: 15px;
  border-radius: 4px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.reply-admin {
  font-weight: bold;
  color: #409eff;
}

.reply-date {
  color: #909399;
}

.reply-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-line;
}

.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-detail i {
  font-size: 64px;
  margin-bottom: 15px;
}

.empty-detail p {
  font-size: 16px;
}
</style> 