<template>
  <MainLayout>
    <div class="messages-page">
      <div class="page-header" data-aos="fade-down">
        <h1 class="page-title">Message Center</h1>
        <p class="page-description">View your system notifications and interaction messages</p>
      </div>

      <!-- Message type tabs -->
      <div class="message-tabs" data-aos="fade-up">
        <el-tabs v-model="activeTab" class="message-tabs">
          <el-tab-pane label="Unread Messages" name="unread">
            <template #label>
              <div class="tab-label">
                <el-icon><Bell /></el-icon>
                Unread Messages
                <el-badge :value="4" class="tab-badge" />
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane label="All Messages" name="all">
            <template #label>
              <div class="tab-label">
                <el-icon><Message /></el-icon>
                All Messages
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- Message list -->
      <div class="messages-list" v-if="!loading">
        <div v-for="message in messages" 
             :key="message.id"
             :class="['message-item', `message-item-${message.id}`, { 'unread': !message.read }]"
             v-motion="{ 
               initial: { opacity: 0, y: 50 },
               visible: { opacity: 1, y: 0 },
               hover: { scale: 1.01 }
             }">
          <div class="message-icon">
            <el-icon :class="message.type">
              <Bell v-if="message.type === 'system'" />
              <Message v-else />
            </el-icon>
          </div>
          <div class="message-content">
            <h3 class="message-title">{{ message.title }}</h3>
            <p class="message-text">{{ message.content }}</p>
            <span class="message-date">{{ message.date }}</span>
          </div>
          <div class="message-actions">
            <el-button 
              v-if="!message.read"
              type="primary" 
              text 
              @click="markAsRead(message)"
              v-motion="{ hover: { scale: 1.1 } }">
              <el-icon><Check /></el-icon>
              Mark as Read
            </el-button>
            <el-button 
              type="danger" 
              text 
              @click="deleteMessage(message.id)"
              v-motion="{ hover: { scale: 1.1 } }">
              <el-icon><Delete /></el-icon>
              Delete
            </el-button>
          </div>
        </div>

        <!-- Empty state -->
        <el-empty 
          v-if="messages.length === 0"
          description="No messages"
          :image-size="200">
        </el-empty>
      </div>

      <!-- Loading state -->
      <div v-else class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { Bell, Message, Delete, Check } from '@element-plus/icons-vue'
import { useMotion } from '@vueuse/motion'
import gsap from 'gsap'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Initialize AOS
onMounted(() => {
  AOS.init({
    duration: 600,
    once: true,
    offset: 50
  })
})

const activeTab = ref('unread')
const loading = ref(true)

// Mock message data
const messages = ref([
  {
    id: 1,
    type: 'system',
    title: 'System Notification',
    content: 'Your reading log has passed review',
    date: '2025-04-12 10:30',
    read: false
  },
  {
    id: 2,
    type: 'comment',
    title: 'Comment Notification',
    content: 'A user has commented on your reading log',
    date: '2025-04-11 15:20',
    read: false
  },
  // ... other messages
])

// Initialize animations
onMounted(async () => {
  setTimeout(() => {
    loading.value = false
  }, 500)

  // Message list animation
  gsap.from('.message-item', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0.2
  })
})

// Mark as read
const markAsRead = (message) => {
  message.read = true
  gsap.to(`.message-item-${message.id}`, {
    backgroundColor: '#f8f9fa',
    duration: 0.3
  })
}

// Delete message
const deleteMessage = (messageId) => {
  const index = messages.value.findIndex(m => m.id === messageId)
  if (index > -1) {
    gsap.to(`.message-item-${messageId}`, {
      opacity: 0,
      x: -100,
      duration: 0.3,
      onComplete: () => {
        messages.value.splice(index, 1)
      }
    })
  }
}
</script>

<style scoped>
.messages-page {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-description {
  color: var(--el-text-color-secondary);
  margin: 8px 0 0 0;
}

.message-tabs {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-badge {
  margin-left: 4px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;
}

.message-item.unread {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.message-item.unread::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--el-color-primary);
}

.message-icon {
  padding: 12px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
}

.message-icon .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.message-content {
  flex: 1;
}

.message-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.message-text {
  color: var(--el-text-color-regular);
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.message-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.message-actions {
  display: flex;
  gap: 12px;
}

.loading-container {
  padding: 24px;
  background: white;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .messages-page {
    padding: 16px;
  }

  .message-item {
    flex-direction: column;
  }

  .message-actions {
    margin-top: 16px;
    justify-content: flex-end;
    width: 100%;
  }
}
</style> 