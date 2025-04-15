<!-- Reading Journal Page -->
<template>
  <MainLayout>
    <div class="reading-log-page">
      <div class="page-header" data-aos="fade-down">
        <h1 class="page-title">Reading Journal</h1>
        <p class="page-description">Track your reading progress and reflections</p>
      </div>

      <div class="log-actions" data-aos="fade-up">
        <el-button type="primary" @click="navigateToAddLog" class="add-log-btn">
          <el-icon><Plus /></el-icon>
          <span>New Entry</span>
        </el-button>
        
        <div class="filter-section">
          <el-input 
            v-model="searchQuery" 
            placeholder="Search by title, author or tags" 
            class="search-input"
            clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select 
            v-model="filterStatus" 
            placeholder="Status" 
            class="filter-select">
            <el-option label="All Statuses" value="" />
            <el-option label="Completed" value="completed" />
            <el-option label="In Progress" value="in-progress" />
            <el-option label="To Read" value="to-read" />
          </el-select>
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            class="date-picker"
          />
        </div>
      </div>

      <div v-if="isLoading" class="loading-container" data-aos="fade">
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="filteredLogs.length === 0" class="empty-state" data-aos="fade-up">
        <img src="../assets/empty-logs.svg" alt="No entries" class="empty-image" />
        <h3>No Reading Entries</h3>
        <p>Start tracking your reading journey by adding your first entry</p>
        <el-button type="primary" @click="navigateToAddLog">
          Add Your First Reading Entry
        </el-button>
      </div>

      <div v-else class="log-list" data-aos="fade-up">
        <div 
          v-for="log in filteredLogs" 
          :key="log.id" 
          class="log-card"
          v-motion="{
            initial: { opacity: 0, y: 50 },
            enter: { opacity: 1, y: 0, 
              transition: { delay: log.index * 100 }
            }
          }"
        >
          <div class="log-status" :class="log.status">
            {{ statusDisplay(log.status) }}
          </div>
          
          <div class="log-content">
            <h3 class="log-title">{{ log.title }}</h3>
            <p class="log-author">by {{ log.author }}</p>
            
            <div class="log-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(log.date) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Timer /></el-icon>
                <span>{{ log.duration }} minutes</span>
              </div>
              <div class="meta-item" v-if="log.mood">
                <el-icon><Star /></el-icon>
                <span>{{ log.mood }}/5</span>
              </div>
            </div>
            
            <div class="log-tags" v-if="log.tags && log.tags.length">
              <el-tag 
                v-for="tag in log.tags" 
                :key="tag" 
                size="small" 
                class="log-tag">
                {{ tag }}
              </el-tag>
            </div>
            
            <div class="log-notes" v-if="log.notes">
              <p>{{ truncateNotes(log.notes) }}</p>
            </div>
          </div>
          
          <div class="log-actions-panel">
            <el-tooltip content="Edit" placement="top">
              <el-button 
                type="primary" 
                circle 
                @click="editLog(log.id)"
                class="action-btn">
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip content="Delete" placement="top">
              <el-button 
                type="danger" 
                circle 
                @click="confirmDelete(log.id)"
                class="action-btn">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Dialog -->
      <el-dialog
        v-model="deleteDialogVisible"
        title="Confirm Deletion"
        width="30%"
        center>
        <span>Are you sure you want to delete this reading entry? This action cannot be undone.</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">Cancel</el-button>
            <el-button type="danger" @click="deleteLog">
              Delete
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { Plus, Search, Calendar, Timer, Star, Edit, Delete } from '@element-plus/icons-vue'
import { useMotion } from '@vueuse/motion'
import { format } from 'date-fns'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Initialize animations
onMounted(() => {
  AOS.init({
    duration: 800,
    once: true
  })
  loadLogs()
})

const router = useRouter()
const isLoading = ref(true)
const logs = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const deleteDialogVisible = ref(false)
const logToDeleteId = ref(null)

// Mock data loading
const loadLogs = () => {
  setTimeout(() => {
    logs.value = [
      {
        id: 1,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        date: new Date('2023-06-15'),
        duration: 120,
        status: 'completed',
        mood: 5,
        tags: ['Fiction', 'Classic', 'American Literature'],
        notes: 'A powerful exploration of racial injustice and moral growth in the American South. The characters were deeply compelling, especially Atticus Finch, whose moral compass and integrity made a strong impression on me.'
      },
      {
        id: 2,
        title: '1984',
        author: 'George Orwell',
        date: new Date('2023-05-28'),
        duration: 90,
        status: 'completed',
        mood: 4,
        tags: ['Dystopian', 'Classic', 'Political'],
        notes: 'A chilling portrayal of totalitarianism and surveillance. The concept of "Big Brother" and "thoughtcrime" remain eerily relevant today.'
      },
      {
        id: 3,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        date: new Date('2023-07-03'),
        duration: 60,
        status: 'in-progress',
        mood: 4,
        tags: ['Fiction', 'Classic', 'American Dream'],
        notes: 'Currently reading this classic tale of wealth, ambition, and the American Dream. The prose is beautiful and the characters are fascinating in their complexity.'
      },
      {
        id: 4,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        date: new Date('2023-07-10'),
        duration: 75,
        status: 'completed',
        mood: 5,
        tags: ['Classic', 'Romance', 'British Literature'],
        notes: 'A timeless exploration of social status, manners, and marriage in early 19th century England. Elizabeth Bennet is such a compelling character with her wit and intelligence.'
      }
    ]
    isLoading.value = false
  }, 1000)
}

// Filter and search functionality
const filteredLogs = computed(() => {
  let result = [...logs.value]
  
  // Add index for staggered animation
  result = result.map((log, index) => ({...log, index}))
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log => 
      log.title.toLowerCase().includes(query) || 
      log.author.toLowerCase().includes(query) ||
      (log.tags && log.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }
  
  // Apply status filter
  if (filterStatus.value) {
    result = result.filter(log => log.status === filterStatus.value)
  }
  
  // Apply date range filter
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = dateRange.value[0]
    const endDate = dateRange.value[1]
    result = result.filter(log => 
      log.date >= startDate && log.date <= endDate
    )
  }
  
  return result
})

// Status display mapping
const statusDisplay = (status) => {
  const map = {
    'completed': 'Completed',
    'in-progress': 'In Progress',
    'to-read': 'To Read'
  }
  return map[status] || status
}

// Format date for display
const formatDate = (date) => {
  if (!date) return ''
  return format(date, 'MMM dd, yyyy')
}

// Truncate notes for preview
const truncateNotes = (notes, length = 100) => {
  if (!notes) return ''
  if (notes.length <= length) return notes
  return notes.substring(0, length) + '...'
}

// Navigation
const navigateToAddLog = () => {
  router.push('/log/add')
}

const editLog = (id) => {
  router.push(`/log/edit/${id}`)
}

// Delete functionality
const confirmDelete = (id) => {
  logToDeleteId.value = id
  deleteDialogVisible.value = true
}

const deleteLog = () => {
  logs.value = logs.value.filter(log => log.id !== logToDeleteId.value)
  deleteDialogVisible.value = false
  logToDeleteId.value = null
}
</script>

<style scoped>
.reading-log-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.2rem;
  color: var(--el-color-primary);
  margin-bottom: 0.5rem;
}

.page-description {
  color: var(--el-text-color-secondary);
  font-size: 1.1rem;
}

.log-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-input {
  width: 240px;
}

.filter-select, .date-picker {
  width: 200px;
}

.add-log-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-image {
  width: 200px;
  max-width: 100%;
  margin-bottom: 1.5rem;
}

.log-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.log-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.log-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.log-status {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  color: white;
  z-index: 1;
}

.log-status.completed {
  background-color: var(--el-color-success);
}

.log-status.in-progress {
  background-color: var(--el-color-warning);
}

.log-status.to-read {
  background-color: var(--el-color-info);
}

.log-content {
  padding: 1.5rem;
}

.log-title {
  font-size: 1.2rem;
  margin: 0 0 0.2rem 0;
  color: var(--el-text-color-primary);
}

.log-author {
  color: var(--el-text-color-secondary);
  margin: 0 0 1rem 0;
  font-style: italic;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
}

.log-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.log-tag {
  border-radius: 12px;
}

.log-notes {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 1rem;
  margin-top: 1rem;
}

.log-actions-panel {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--el-color-primary-light-9);
  border-top: 1px solid var(--el-border-color-light);
}

.action-btn {
  opacity: 0.8;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.loading-container {
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .log-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-section {
    width: 100%;
  }
  
  .search-input, .filter-select, .date-picker {
    width: 100%;
  }
  
  .log-list {
    grid-template-columns: 1fr;
  }
}
</style> 