<template>
  <MainLayout>
    <div class="logs-page">
      <div class="page-header">
        <h1 class="page-title">阅读日志管理</h1>
        <p class="page-description">管理您的所有阅读记录和笔记</p>
      </div>
      
      <!-- 操作工具栏 -->
      <div class="toolbar">
        <div class="left-tools">
          <el-button type="primary" @click="$router.push('/logs/create')">
            <el-icon><Plus /></el-icon> 新增日志
          </el-button>
        </div>
        
        <div class="right-tools">
          <el-input
            v-model="searchQuery"
            placeholder="搜索标题或作者"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select 
            v-model="statusFilter" 
            placeholder="状态筛选" 
            clearable
            class="filter-select"
          >
            <el-option label="已通过" value="approved" />
            <el-option label="审核中" value="pending" />
            <el-option label="未通过" value="rejected" />
          </el-select>
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="date-picker"
          />
        </div>
      </div>
      
      <!-- 日志列表 -->
      <el-card shadow="never" class="logs-list-card">
        <template v-if="loading">
          <div class="loading-container">
            <el-skeleton :rows="10" animated />
          </div>
        </template>
        
        <template v-else-if="filteredLogs.length === 0">
          <div class="empty-logs">
            <el-empty description="暂无阅读日志" />
            <el-button type="primary" @click="$router.push('/logs/create')">
              记录第一篇阅读日志
            </el-button>
          </div>
        </template>
        
        <template v-else>
          <el-table 
            :data="filteredLogs" 
            style="width: 100%" 
            @row-click="handleRowClick"
            row-key="id"
            v-loading="tableLoading"
          >
            <el-table-column prop="title" label="标题" min-width="200">
              <template #default="{ row }">
                <div class="log-title">{{ row.title }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="作者" width="150" />
            <el-table-column prop="date" label="阅读日期" width="120" />
            <el-table-column prop="duration" label="时长" width="100">
              <template #default="{ row }">
                {{ row.duration }} 分钟
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button 
                  size="small" 
                  type="primary" 
                  text
                  @click.stop="viewLog(row.id)"
                >
                  查看
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  text
                  @click.stop="editLog(row.id)"
                >
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  text
                  @click.stop="confirmDelete(row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalLogs"
              :page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </el-card>
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
  </MainLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLogStore } from '../store/log'
import MainLayout from '../layouts/MainLayout.vue'
import { Plus, Search } from '@element-plus/icons-vue'

const router = useRouter()
const logStore = useLogStore()

// 状态
const loading = ref(true)
const tableLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalLogs = ref(0)

// 删除对话框
const deleteDialog = reactive({
  visible: false,
  loading: false,
  logId: null
})

// 计算属性 - 过滤后的日志
const filteredLogs = computed(() => {
  let result = [...logStore.logs]
  
  // 搜索标题或作者
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log => 
      log.title.toLowerCase().includes(query) || 
      log.author.toLowerCase().includes(query)
    )
  }
  
  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(log => log.status === statusFilter.value)
  }
  
  // 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(log => {
      const logDate = log.date
      return logDate >= start && logDate <= end
    })
  }
  
  return result
})

// 监听过滤条件变化，重置到第一页
watch([searchQuery, statusFilter, dateRange], () => {
  currentPage.value = 1
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

// 行点击处理
const handleRowClick = (row) => {
  viewLog(row.id)
}

// 查看日志
const viewLog = (id) => {
  router.push(`/logs/${id}`)
}

// 编辑日志
const editLog = (id) => {
  router.push(`/logs/edit/${id}`)
}

// 确认删除
const confirmDelete = (id) => {
  deleteDialog.logId = id
  deleteDialog.visible = true
}

// 删除日志
const deleteLog = async () => {
  if (!deleteDialog.logId) return
  
  try {
    deleteDialog.loading = true
    await logStore.deleteLog(deleteDialog.logId)
    
    ElMessage({
      type: 'success',
      message: '日志删除成功'
    })
  } catch (error) {
    ElMessage.error('删除失败，请稍后再试')
    console.error(error)
  } finally {
    deleteDialog.loading = false
    deleteDialog.visible = false
    deleteDialog.logId = null
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 初始化
onMounted(async () => {
  try {
    const result = await logStore.fetchLogs()
    totalLogs.value = result.total
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.logs-page {
  padding-bottom: 40px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.left-tools, .right-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.filter-select {
  width: 120px;
}

.date-picker {
  width: 320px;
}

.logs-list-card {
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px 0;
}

.empty-logs {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-logs .el-button {
  margin-top: 20px;
}

.log-title {
  font-weight: 500;
  color: var(--text-primary);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .right-tools {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .search-input,
  .filter-select,
  .date-picker {
    width: 100%;
  }
}
</style> 