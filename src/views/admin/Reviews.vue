<template>
  <div class="admin-reviews">
    <div class="container">
      <h1 class="page-title">日志审核</h1>
      
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-select 
          v-model="statusFilter" 
          placeholder="审核状态" 
          @change="handleStatusChange"
          class="status-filter"
        >
          <el-option label="待审核" value="pending"></el-option>
          <el-option label="已通过" value="approved"></el-option>
          <el-option label="已拒绝" value="rejected"></el-option>
          <el-option label="全部" value="all"></el-option>
        </el-select>
      </div>
      
      <!-- 日志列表 -->
      <div class="logs-container" v-loading="loading">
        <template v-if="logsList.length > 0">
          <div 
            v-for="log in logsList" 
            :key="log.id"
            class="log-card"
            :class="{'log-pending': log.status === 'pending', 'log-rejected': log.status === 'rejected'}"
          >
            <div class="log-header">
              <div class="log-title-section">
                <h3 class="log-title">{{ log.title }}</h3>
                <el-tag 
                  :type="getStatusType(log.status)" 
                  size="small"
                >
                  {{ getStatusText(log.status) }}
                </el-tag>
              </div>
              <div class="log-meta">
                <span>作者: {{ log.author }}</span>
                <span>提交时间: {{ log.submitDate }}</span>
              </div>
            </div>
            
            <div class="log-content">
              <p>{{ truncateContent(log.content) }}</p>
            </div>
            
            <div class="log-actions">
              <el-button 
                type="primary" 
                size="small" 
                plain
                @click="viewLogDetail(log.id)"
              >
                查看详情
              </el-button>
              
              <template v-if="log.status === 'pending'">
                <el-button 
                  type="success" 
                  size="small"
                  @click="approveLog(log)"
                >
                  通过
                </el-button>
                
                <el-button 
                  type="danger" 
                  size="small"
                  @click="openRejectDialog(log)"
                >
                  不通过
                </el-button>
              </template>
              
              <el-dropdown 
                trigger="click" 
                @command="(command) => handleCommand(command, log)"
                v-if="log.status === 'pending'"
              >
                <el-button 
                  type="info" 
                  size="small"
                  plain
                >
                  更多操作<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="delete">删除日志</el-dropdown-item>
                    <el-dropdown-item command="ban" divided>封禁作者</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container">
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
        </template>
        
        <div v-else class="empty-data">
          <i class="el-icon-document"></i>
          <p>暂无{{ statusFilter === 'pending' ? '待审核' : '' }}日志</p>
        </div>
      </div>
      
      <!-- 日志详情对话框 -->
      <el-dialog 
        v-model="logDetailVisible" 
        title="日志详情" 
        width="700px"
      >
        <div v-if="selectedLog" class="log-detail">
          <div class="detail-header">
            <h2>{{ selectedLog.title }}</h2>
            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-label">作者:</span>
                <span>{{ selectedLog.author }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">阅读日期:</span>
                <span>{{ selectedLog.readDate }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">阅读时长:</span>
                <span>{{ selectedLog.readDuration }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">提交时间:</span>
                <span>{{ selectedLog.submitDate }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">状态:</span>
                <el-tag :type="getStatusType(selectedLog.status)">
                  {{ getStatusText(selectedLog.status) }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="detail-content">
            <h3>内容</h3>
            <div class="content-box">
              {{ selectedLog.content }}
            </div>
          </div>
          
          <div class="review-actions" v-if="selectedLog.status === 'pending'">
            <el-button 
              type="success" 
              @click="approveLog(selectedLog); logDetailVisible = false"
            >
              通过
            </el-button>
            
            <el-button 
              type="danger" 
              @click="openRejectDialog(selectedLog); logDetailVisible = false"
            >
              不通过
            </el-button>
            
            <el-button 
              @click="handleCommand('delete', selectedLog); logDetailVisible = false"
            >
              删除日志
            </el-button>
            
            <el-button 
              type="warning" 
              @click="handleCommand('ban', selectedLog); logDetailVisible = false"
            >
              封禁作者
            </el-button>
          </div>
          
          <div class="reject-info" v-if="selectedLog.status === 'rejected'">
            <h3>拒绝原因</h3>
            <p>{{ selectedLog.rejectReason }}</p>
          </div>
        </div>
      </el-dialog>
      
      <!-- 拒绝原因对话框 -->
      <el-dialog 
        v-model="rejectDialogVisible" 
        title="拒绝日志" 
        width="500px"
      >
        <div class="reject-dialog">
          <p>您确定要拒绝通过日志 <strong>{{ rejectLog?.title }}</strong> 吗？</p>
          
          <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef" label-width="80px">
            <el-form-item label="拒绝原因" prop="reason">
              <el-input 
                type="textarea" 
                v-model="rejectForm.reason"
                :rows="3"
                placeholder="请输入拒绝原因"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <template #footer>
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmRejectLog">确认拒绝</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminReviews',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    
    // 筛选
    const statusFilter = ref('pending')
    
    // 分页
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalItems = ref(0)
    
    // 日志列表
    const logsList = ref([])
    
    // 日志详情
    const logDetailVisible = ref(false)
    const selectedLog = ref(null)
    
    // 拒绝日志
    const rejectDialogVisible = ref(false)
    const rejectLog = ref(null)
    const rejectFormRef = ref(null)
    const rejectForm = reactive({
      reason: ''
    })
    const rejectRules = {
      reason: [
        { required: true, message: '请输入拒绝原因', trigger: 'blur' },
        { min: 5, message: '拒绝原因至少5个字符', trigger: 'blur' }
      ]
    }
    
    // 加载日志列表
    const loadLogsList = () => {
      loading.value = true
      
      // 模拟API请求
      setTimeout(() => {
        // 模拟数据
        const allLogs = [
          {
            id: 1,
            title: '《三体》读后感',
            author: '张三',
            submitDate: '2023-04-05 14:30',
            readDate: '2023-04-01',
            readDuration: '3小时',
            content: '《三体》是刘慈欣创作的科幻小说，讲述了地球文明与三体文明的相遇、对抗。书中描绘了宇宙中的黑暗森林法则，展现了人类在极端环境下的各种选择。这本书让我深刻体会到宇宙的广袤和人类的渺小，同时也思考了文明存续的条件和可能性。刘慈欣的想象力令人惊叹，故事情节引人入胜，值得一读。',
            status: 'pending'
          },
          {
            id: 2,
            title: '《百年孤独》阅读心得',
            author: '李四',
            submitDate: '2023-04-04 10:15',
            readDate: '2023-03-28',
            readDuration: '5小时',
            content: '《百年孤独》是马尔克斯的代表作，讲述了布恩迪亚家族七代人的故事。小说通过魔幻现实主义的手法，将拉丁美洲的历史与神话交织在一起。阅读这部作品时，我被其丰富的想象力和浓厚的寓意所震撼。书中的孤独主题贯穿始终，令人深思。马尔克斯笔下的马孔多就像一个微缩的世界，反映了人类社会的各种矛盾与挣扎。',
            status: 'approved'
          },
          {
            id: 3,
            title: '《人类简史》读书笔记',
            author: '王五',
            submitDate: '2023-04-03 16:45',
            readDate: '2023-03-25',
            readDuration: '4小时',
            content: '《人类简史》从生物学视角出发，讲述了智人如何从非洲大草原走向全球统治地位的历程。作者尤瓦尔·赫拉利的观点独特而犀利，他认为农业革命是人类史上最大的陷阱，而信息和想象力是智人成功的关键。这本书打破了我对历史的传统认知，让我重新思考人类社会的发展轨迹和未来走向。尤其是关于"虚构故事的力量"这一观点，深刻揭示了人类社会运作的核心机制。',
            status: 'rejected',
            rejectReason: '内容过于简单，请增加个人阅读感受和思考。'
          }
        ]
        
        // 根据筛选条件过滤
        if (statusFilter.value !== 'all') {
          logsList.value = allLogs.filter(log => log.status === statusFilter.value)
        } else {
          logsList.value = allLogs
        }
        
        totalItems.value = logsList.value.length
        loading.value = false
      }, 500)
    }
    
    // 初始化
    onMounted(() => {
      loadLogsList()
    })
    
    // 筛选处理
    const handleStatusChange = () => {
      currentPage.value = 1
      loadLogsList()
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      loadLogsList()
    }
    
    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadLogsList()
    }
    
    // 查看日志详情
    const viewLogDetail = (logId) => {
      const log = logsList.value.find(l => l.id === logId)
      if (log) {
        selectedLog.value = log
        logDetailVisible.value = true
      }
    }
    
    // 批准日志
    const approveLog = (log) => {
      ElMessageBox.confirm(
        `确定要通过日志《${log.title}》吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        // 模拟API请求
        setTimeout(() => {
          const index = logsList.value.findIndex(l => l.id === log.id)
          if (index !== -1) {
            logsList.value[index].status = 'approved'
          }
          ElMessage.success('日志已通过审核')
        }, 500)
      }).catch(() => {})
    }
    
    // 拒绝日志
    const openRejectDialog = (log) => {
      rejectLog.value = log
      rejectDialogVisible.value = true
    }
    
    const confirmRejectLog = async () => {
      if (!rejectFormRef.value) return
      
      await rejectFormRef.value.validate((valid) => {
        if (valid) {
          // 模拟API请求
          setTimeout(() => {
            const index = logsList.value.findIndex(l => l.id === rejectLog.value.id)
            if (index !== -1) {
              logsList.value[index].status = 'rejected'
              logsList.value[index].rejectReason = rejectForm.reason
            }
            
            rejectDialogVisible.value = false
            rejectForm.reason = ''
            ElMessage.success('已拒绝通过该日志')
          }, 500)
        }
      })
    }
    
    // 更多操作
    const handleCommand = (command, log) => {
      switch (command) {
        case 'delete':
          deleteLog(log)
          break
        case 'ban':
          banAuthor(log)
          break
      }
    }
    
    // 删除日志
    const deleteLog = (log) => {
      ElMessageBox.confirm(
        `确定要删除日志《${log.title}》吗？删除后将无法恢复。`,
        '警告',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 模拟API请求
        setTimeout(() => {
          logsList.value = logsList.value.filter(l => l.id !== log.id)
          ElMessage.success('日志已删除')
        }, 500)
      }).catch(() => {})
    }
    
    // 封禁作者
    const banAuthor = (log) => {
      ElMessageBox.confirm(
        `确定要封禁用户 ${log.author} 吗？`,
        '警告',
        {
          confirmButtonText: '确定封禁',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        router.push('/admin/users')
        // 这里需要实际集成用户管理的封禁流程
        ElMessage.info('已跳转到用户管理页面，请在那里完成封禁操作')
      }).catch(() => {})
    }
    
    // 辅助函数
    const truncateContent = (content) => {
      return content.length > 150 ? content.substring(0, 150) + '...' : content
    }
    
    const getStatusType = (status) => {
      switch (status) {
        case 'pending': return 'warning'
        case 'approved': return 'success'
        case 'rejected': return 'danger'
        default: return 'info'
      }
    }
    
    const getStatusText = (status) => {
      switch (status) {
        case 'pending': return '待审核'
        case 'approved': return '已通过'
        case 'rejected': return '已拒绝'
        default: return '未知'
      }
    }
    
    return {
      loading,
      statusFilter,
      currentPage,
      pageSize,
      totalItems,
      logsList,
      logDetailVisible,
      selectedLog,
      rejectDialogVisible,
      rejectLog,
      rejectFormRef,
      rejectForm,
      rejectRules,
      handleStatusChange,
      handleSizeChange,
      handleCurrentChange,
      viewLogDetail,
      approveLog,
      openRejectDialog,
      confirmRejectLog,
      handleCommand,
      truncateContent,
      getStatusType,
      getStatusText
    }
  }
}
</script>

<style scoped>
.admin-reviews {
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
  align-items: center;
}

.status-filter {
  width: 120px;
}

/* 日志列表 */
.logs-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 300px;
}

.log-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.log-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.log-pending {
  border-left: 4px solid #e6a23c;
}

.log-rejected {
  border-left: 4px solid #f56c6c;
}

.log-header {
  margin-bottom: 10px;
}

.log-title-section {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.log-title {
  margin: 0;
  font-size: 18px;
  margin-right: 10px;
}

.log-meta {
  color: #909399;
  font-size: 13px;
  display: flex;
  gap: 15px;
}

.log-content {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.log-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

/* 日志详情 */
.log-detail {
  padding: 0 10px;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.detail-header h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 20px;
  color: #303133;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: #606266;
  margin-right: 5px;
  font-weight: bold;
}

.detail-content h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.content-box {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-line;
}

.review-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.reject-info {
  margin-top: 20px;
  background: #fef0f0;
  padding: 15px;
  border-radius: 4px;
}

.reject-info h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 10px;
  color: #f56c6c;
}

.reject-info p {
  margin: 0;
  color: #606266;
}

/* 拒绝对话框 */
.reject-dialog p {
  margin-bottom: 15px;
}
</style> 