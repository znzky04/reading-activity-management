<template>
  <MainLayout>
    <div class="logs-page">
      <div class="page-header" data-aos="fade-down">
        <h1 class="page-title">Reading Log</h1>
        <p class="page-description">Record your reading journey</p>
      </div>
      
      <!-- Action Bar -->
      <div class="action-bar" data-aos="fade-right">
        <el-button type="primary" @click="$router.push('/logs/create')" v-motion="{ hover: { scale: 1.05 } }">
          <font-awesome-icon icon="plus" class="button-icon" /> New Entry
        </el-button>
        
        <div class="filters">
          <el-input
            v-model="searchQuery"
            placeholder="Search log..."
            class="search-input"
          >
            <template #prefix>
              <font-awesome-icon icon="search" />
            </template>
          </el-input>
          
          <el-select v-model="filterStatus" placeholder="Status" class="filter-select">
            <el-option label="All" value="" />
            <el-option label="Completed" value="completed" />
            <el-option label="In Progress" value="in_progress" />
          </el-select>
          
          <el-select v-model="sortBy" placeholder="Sort" class="filter-select">
            <el-option label="Latest First" value="latest" />
            <el-option label="Oldest First" value="oldest" />
            <el-option label="Longest Duration" value="duration" />
          </el-select>
        </div>
      </div>
      
      <!-- Log List -->
      <div class="logs-list" v-if="!loading">
        <el-card v-for="(log, index) in filteredLogs" 
          :key="log.id" 
          class="log-item"
          shadow="hover"
          data-aos="fade-up"
          :data-aos-delay="index * 50"
          v-motion="{ hover: { y: -5 } }">
          <div class="log-content">
            <div class="log-main">
              <h3 class="log-title">{{ log.title }}</h3>
              <div class="log-info">
                <span class="info-item">
                  <font-awesome-icon :icon="['far', 'user']" class="info-icon" />
                  {{ log.author }}
                </span>
                <span class="info-item">
                  <font-awesome-icon :icon="['far', 'calendar']" class="info-icon" />
                  {{ log.date }}
                </span>
                <span class="info-item">
                  <font-awesome-icon :icon="['far', 'clock']" class="info-icon" />
                  {{ log.duration }} minutes
                </span>
              </div>
            </div>
            
            <div class="log-status">
              <el-tag :type="getStatusType(log.status)" size="small" effect="light">
                {{ getStatusText(log.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="log-actions">
            <el-button 
              size="small" 
              type="primary" 
              text
              @click="viewLog(log.id)"
              v-motion="{ hover: { x: 5 } }"
            >
              <font-awesome-icon icon="eye" class="action-icon" /> View
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              text
              @click="editLog(log.id)"
              v-motion="{ hover: { x: 5 } }"
            >
              <font-awesome-icon icon="edit" class="action-icon" /> Edit
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              text
              @click="confirmDelete(log.id)"
              v-motion="{ hover: { x: 5 } }"
            >
              <font-awesome-icon icon="trash" class="action-icon" /> Delete
            </el-button>
          </div>
        </el-card>
        
        <!-- Empty State -->
        <el-empty 
          v-if="filteredLogs.length === 0"
          description="No reading log"
          :image-size="200"
        >
          <el-button type="primary" @click="$router.push('/logs/create')">
            Record the first reading log
          </el-button>
        </el-empty>
      </div>
      
      <!-- Loading State -->
      <div v-else class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <!-- Pagination -->
      <div class="pagination" v-if="!loading && filteredLogs.length > 0" data-aos="fade-up">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <el-dialog
      v-model="deleteDialog.visible"
      title="Confirm Delete"
      width="30%"
      :close-on-click-modal="false"
    >
      <span>Are you sure you want to delete this reading log? This operation cannot be undone.</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialog.visible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteLog" :loading="deleteDialog.loading">
            Confirm Delete
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
import { Plus, Search, Filter, User, Calendar, Timer } from '@element-plus/icons-vue'
import gsap from 'gsap'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = useRouter()
const logStore = useLogStore()

// Status 
const loading = ref(true)
const tableLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalLogs = ref(0)

// Delete dialog
const deleteDialog = reactive({
  visible: false,
  loading: false,
  logId: null
})

// Computed property - filtered logs
const filteredLogs = computed(() => {
  let result = [...logStore.logs]
  
  // Search by title or author
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log => 
      log.title.toLowerCase().includes(query) || 
      log.author.toLowerCase().includes(query)
    )
  }
  
  // Status filter
  if (statusFilter.value) {
    result = result.filter(log => log.status === statusFilter.value)
  }
  
  // Date range filter
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(log => {
      const logDate = log.date
      return logDate >= start && logDate <= end
    })
  }
  
  return result
})

// Watch for filter changes, reset to first page
watch([searchQuery, statusFilter, dateRange], () => {
  currentPage.value = 1
})

// Get status display type
const getStatusType = (status) => {
  const map = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

// Get status display text
const getStatusText = (status) => {
  const map = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected'
  }
  return map[status] || 'Unknown'
}

// Row click handler
const handleRowClick = (row) => {
  viewLog(row.id)
}

// View log
const viewLog = (id) => {
  router.push(`/logs/${id}`)
}

// Edit log
const editLog = (id) => {
  router.push(`/logs/edit/${id}`)
}

// Confirm delete
const confirmDelete = (id) => {
  deleteDialog.logId = id
  deleteDialog.visible = true
}

// Delete log
const deleteLog = async () => {
  if (!deleteDialog.logId) return
  
  try {
    deleteDialog.loading = true
    await logStore.deleteLog(deleteDialog.logId)
    
    ElMessage({
      type: 'success',
      message: 'Log deleted successfully'
    })
  } catch (error) {
    ElMessage.error('Delete failed, please try again later')
    console.error(error)
  } finally {
    deleteDialog.loading = false
    deleteDialog.visible = false
    deleteDialog.logId = null
  }
}

// Pagination handlers
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// Initialize
onMounted(async () => {
  try {
    const result = await logStore.fetchLogs()
    totalLogs.value = result.total
    
    // Override with English titles and authors if Chinese ones are detected
    const englishTitles = [
      "To Kill a Mockingbird",
      "1984",
      "Pride and Prejudice",
      "The Great Gatsby",
      "Lord of the Flies",
      "Brave New World",
      "The Catcher in the Rye",
      "Fahrenheit 451"
    ];
    
    const englishAuthors = [
      "Harper Lee",
      "George Orwell",
      "Jane Austen",
      "F. Scott Fitzgerald",
      "William Golding",
      "Aldous Huxley",
      "J.D. Salinger",
      "Ray Bradbury"
    ];
    
    // Replace Chinese titles and authors with English ones
    logStore.logs.forEach((log, index) => {
      if (log.title.includes('阅读日志')) {
        log.title = englishTitles[index % englishTitles.length];
        log.author = englishAuthors[index % englishAuthors.length];
      }
    });
  } finally {
    loading.value = false
  }
})

// Initialize AOS
onMounted(() => {
  AOS.init({
    duration: 800,
    once: true
  })
})

// GSAP animations
onMounted(() => {
  // List item animations
  gsap.from('.log-item', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  })
})
</script>

<style scoped>
/* Button icon styles */
.button-icon {
  margin-right: 5px;
}

/* Info icon styles */
.info-icon {
  margin-right: 5px;
  width: 14px;
}

/* Action icon styles */
.action-icon {
  margin-right: 3px;
  font-size: 14px;
}

.logs-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-description {
  color: var(--el-text-color-secondary);
  font-size: 16px;
}

.action-bar {
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

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
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

.log-item {
  border: none;
  background: linear-gradient(to right, #ffffff, #f8f9fa);
  transition: all 0.3s ease;
}

.log-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  background: linear-gradient(to right, #ffffff, #f0f2f5);
}

.log-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.log-main {
  flex: 1;
}

.log-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
}

.log-info {
  display: flex;
  gap: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-item .el-icon {
  font-size: 16px;
}

.log-status {
  padding-left: 20px;
}

.log-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 16px;
  padding-top: 16px;
}

.action-bar {
  background-color: var(--el-bg-color);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.filters {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .log-content {
    flex-direction: column;
  }
  
  .log-status {
    padding-left: 0;
    margin-top: 12px;
  }
  
  .log-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
    max-width: none;
  }
}
</style> 