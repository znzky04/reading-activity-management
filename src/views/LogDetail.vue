<template>
  <MainLayout>
    <div class="log-detail-page">
      <!-- Top Action Bar -->
      <div class="action-bar">
        <el-button @click="goBack" icon="ArrowLeft">Return</el-button>
        
        <div class="right-actions" v-if="!loading && log">
          <!-- Users can edit and delete their own logs -->
          <el-button type="primary" plain @click="editLog">
            <el-icon><Edit /></el-icon> Edit
          </el-button>
          <el-button type="danger" plain @click="confirmDelete">
            <el-icon><Delete /></el-icon> Delete
          </el-button>
          
          <!-- Admins can mark as violation -->
          <el-button 
            v-if="userStore.isAdmin && log.status !== 'rejected'" 
            type="warning" 
            plain 
            @click="rejectDialog.visible = true"
          >
            <el-icon><Warning /></el-icon> Mark as Violation
          </el-button>
        </div>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="15" animated />
      </div>
      
      <!-- Main Content -->
      <template v-else-if="log">
        <!-- Log Status Alert -->
        <el-alert
          v-if="log.status === 'pending'"
          title="This log is under review, it will be visible to other users after approval"
          type="warning"
          show-icon
          :closable="false"
          class="status-alert"
        />
        
        <el-alert
          v-if="log.status === 'rejected'"
          :title="`This log did not pass review: ${log.rejectReason || 'Violated platform rules'}`"
          type="error"
          show-icon
          :closable="false"
          class="status-alert"
        />
        
        <!-- Log Header Information -->
        <div class="log-header">
          <h1 class="log-title">{{ log.title }}</h1>
          
          <div class="log-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon> 
              Author: {{ log.author }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              Reading Date: {{ log.date }}
            </span>
            <span class="meta-item">
              <el-icon><Timer /></el-icon>
              Reading Duration: {{ log.duration }} minutes
            </span>
            <span class="meta-item">
              <el-icon><InfoFilled /></el-icon>
              Status: 
              <el-tag :type="getStatusType(log.status)" size="small">
                {{ getStatusText(log.status) }}
              </el-tag>
            </span>
          </div>
        </div>
        
        <!-- Log Content -->
        <el-card class="log-content-card" shadow="hover">
          <div class="log-content" v-html="formattedContent"></div>
        </el-card>
      </template>
      
      <!-- Data Not Found -->
      <el-empty 
        v-else 
        description="Reading log not found" 
        class="empty-container"
      >
        <el-button type="primary" @click="goBack">Return to Log List</el-button>
      </el-empty>
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
    
    <!-- Violation Marking Dialog -->
    <el-dialog
      v-model="rejectDialog.visible"
      title="Mark as Violation"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectDialog.form" label-width="100px">
        <el-form-item label="Violation Reason" required>
          <el-select v-model="rejectDialog.form.reason" placeholder="Please select a violation reason" style="width: 100%">
            <el-option label="Content does not meet platform standards" value="Content does not meet platform standards" />
            <el-option label="Contains sensitive content" value="Contains sensitive content" />
            <el-option label="Suspected plagiarism/copyright infringement" value="Suspected plagiarism/copyright infringement" />
            <el-option label="Other reasons" value="Other reasons" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Detailed Description">
          <el-input 
            v-model="rejectDialog.form.detail" 
            type="textarea" 
            rows="4" 
            placeholder="Please enter detailed description (optional)"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialog.visible = false">Cancel</el-button>
          <el-button 
            type="danger" 
            @click="rejectLog"
            :loading="rejectDialog.loading"
          >
            Confirm Mark as Violation
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
import gsap from 'gsap'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useMotion } from '@vueuse/motion'

const route = useRoute()
const router = useRouter()
const logStore = useLogStore()
const userStore = useUserStore()

// States
const loading = ref(true)
const log = ref(null)

// Delete dialog
const deleteDialog = reactive({
  visible: false,
  loading: false
})

// Violation marking dialog
const rejectDialog = reactive({
  visible: false,
  loading: false,
  form: {
    reason: '',
    detail: ''
  }
})

// Computed property - formatted content (handling line breaks)
const formattedContent = computed(() => {
  if (!log.value || !log.value.content) return ''
  
  // Convert line breaks to <br>
  return log.value.content.replace(/\n/g, '<br>')
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
    pending: 'Under Review',
    rejected: 'Not Approved'
  }
  return map[status] || 'Unknown'
}

// Go back to previous page
const goBack = () => {
  router.push('/logs')
}

// Edit log
const editLog = () => {
  router.push(`/logs/edit/${route.params.id}`)
}

// Confirm delete
const confirmDelete = () => {
  deleteDialog.visible = true
}

// Delete log
const deleteLog = async () => {
  try {
    deleteDialog.loading = true
    await logStore.deleteLog(route.params.id)
    
    ElMessage({
      type: 'success',
      message: 'Log deleted successfully'
    })
    
    router.push('/logs')
  } catch (error) {
    ElMessage.error('Deletion failed, please try again later')
    console.error(error)
  } finally {
    deleteDialog.loading = false
    deleteDialog.visible = false
  }
}

// Mark as violation
const rejectLog = async () => {
  if (!rejectDialog.form.reason) {
    ElMessage.warning('Please select a violation reason')
    return
  }
  
  try {
    rejectDialog.loading = true
    
    // Build complete violation reason
    const rejectReason = rejectDialog.form.detail
      ? `${rejectDialog.form.reason}: ${rejectDialog.form.detail}`
      : rejectDialog.form.reason
    
    // Update log status
    await logStore.updateLog(route.params.id, {
      status: 'rejected',
      rejectReason
    })
    
    // Re-fetch log details
    await fetchLogDetail()
    
    ElMessage({
      type: 'success',
      message: 'Marked as Violation Content'
    })
    
    rejectDialog.visible = false
  } catch (error) {
    ElMessage.error('Operation failed, please try again later')
    console.error(error)
  } finally {
    rejectDialog.loading = false
  }
}

// Get log details
const fetchLogDetail = async () => {
  loading.value = true
  
  try {
    const result = await logStore.fetchLogDetail(route.params.id)
    log.value = result
  } catch (error) {
    ElMessage.error('Failed to get log details')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchLogDetail()
  AOS.init({
    duration: 800,
    once: true
  })
})

// Animation reference
const contentCard = ref(null)
const { motion: contentMotion } = useMotion(contentCard, {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } }
})

// GSAP animation
onMounted(() => {
  // Title animation
  gsap.from('.log-title', {
    opacity: 0,
    y: -20,
    duration: 0.8,
    ease: 'power2.out'
  })

  // Meta information animation
  gsap.from('.meta-item', {
    opacity: 0,
    x: -20,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0.3
  })

  // Content animation
  gsap.from('.log-content', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.5
  })
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

/* Responsive adjustments */
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

/* Add animation transition effect */
.back-button {
  margin-bottom: 20px;
}

.meta-item {
  transition: all 0.3s ease;
}

.meta-item:hover {
  transform: translateX(5px);
}

.content-card {
  transition: all 0.3s ease;
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--el-box-shadow-light);
}

.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-2px);
}
</style> 