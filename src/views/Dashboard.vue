<template>
  <MainLayout>
    <div class="dashboard">
      <div class="page-header" data-aos="fade-down">
        <h1 class="page-title">My Home Page</h1>
        <p class="page-description">Welcome back, view your reading situation</p>
      </div>
      
      <!-- 用户信息卡片 -->
      <el-card class="user-info-card" shadow="hover" ref="userInfoCard" v-motion>
        <div class="user-info">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar"></el-avatar>
          <div class="user-details">
            <h3 class="user-name">{{ userStore.userInfo?.email }}</h3>
            <p class="user-since">Join Time: {{ joinDate }}</p>
          </div>
        </div>
      </el-card>

      <!-- 阅读概览 -->
      <div class="reading-overview" data-aos="fade-up">
        <div class="overview-header">
          <h2 class="section-title">Reading Overview</h2>
          <div class="time-selector">
            <el-radio-group v-model="timeRange" size="small">
              <el-radio-button label="week">This Week</el-radio-button>
              <el-radio-button label="month">This Month</el-radio-button>
              <el-radio-button label="year">This Year</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="overview-cards">
          <div class="overview-card" data-aos="zoom-in" data-aos-delay="100">
            <el-icon class="card-icon"><Trophy /></el-icon>
            <div class="card-content">
              <h3 class="card-title">Reading Achievement</h3>
              <div class="achievement-list">
                <div class="achievement" v-motion="{ hover: { scale: 1.05 } }">
                  <el-icon><Medal /></el-icon>
                  <span>Continuous Check-in {{ streak }} Days</span>
                </div>
                <div class="achievement" v-motion="{ hover: { scale: 1.05 } }">
                  <el-icon><Star /></el-icon>
                  <span>Complete Monthly Goal</span>
                </div>
              </div>
            </div>
          </div>

          <div class="overview-card" data-aos="zoom-in" data-aos-delay="200">
            <el-icon class="card-icon"><TrendCharts /></el-icon>
            <div class="card-content">
              <h3 class="card-title">Reading Trend</h3>
              <div class="trend-chart">
                <div v-for="(value, index) in [30, 45, 25, 60, 35, 50, 40]" 
                     :key="index" 
                     class="chart-bar"
                     :style="{ height: value + '%' }"
                     data-aos="height"
                     :data-aos-delay="index * 100">
                </div>
              </div>
              <div class="chart-labels">
                <span v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" 
                      :key="day">{{ day }}</span>
              </div>
            </div>
          </div>

          <div class="overview-card" data-aos="zoom-in" data-aos-delay="300">
            <el-icon class="card-icon"><Reading /></el-icon>
            <div class="card-content">
              <h3 class="card-title">Reading Category</h3>
              <div class="category-list">
                <div class="category-item" v-motion="{ hover: { x: 5 } }">
                  <span class="category-name">Literature and Art</span>
                  <el-progress :percentage="65" :show-text="false" />
                </div>
                <div class="category-item" v-motion="{ hover: { x: 5 } }">
                  <span class="category-name">Technology Frontier</span>
                  <el-progress :percentage="45" :show-text="false" />
                </div>
                <div class="category-item" v-motion="{ hover: { x: 5 } }">
                  <span class="category-name">Historical and Cultural</span>
                  <el-progress :percentage="30" :show-text="false" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 阅读统计卡片 -->
      <div class="stats-container">
        <div class="stats-row">
          <el-card class="stat-card reading-time" shadow="hover" data-aos="fade-up">
            <template #header>
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon><Clock /></el-icon> Reading Time
                </h3>
              </div>
            </template>
            <div class="stat-content">
              <div class="stat-value">{{ formatTime(logStore.readingTime) }}</div>
              <el-progress
                :percentage="Math.min(100, (logStore.readingTime / 3000) * 100)"
                :format="() => ''"
                :stroke-width="12"
                :show-text="false"
              ></el-progress>
              <div class="stat-desc">
                Monthly Goal: 50 Hours
              </div>
            </div>
          </el-card>
          
          <el-card class="stat-card total-logs" shadow="hover" data-aos="fade-up">
            <template #header>
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon><Notebook /></el-icon> Reading Log
                </h3>
              </div>
            </template>
            <div class="stat-content">
              <div class="stat-value">{{ logStore.totalLogs }}</div>
              <el-progress
                :percentage="Math.min(100, (logStore.totalLogs / 50) * 100)"
                :format="() => ''"
                :stroke-width="12"
                :show-text="false"
              ></el-progress>
              <div class="stat-desc">
                This Year Goal: 50 Articles
              </div>
            </div>
          </el-card>
          
          <el-card class="stat-card streak" shadow="hover" data-aos="fade-up">
            <template #header>
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon><Calendar /></el-icon> Continuous Reading
                </h3>
              </div>
            </template>
            <div class="stat-content">
              <div class="stat-value streak-value">{{ streak }} Days</div>
              <div class="streak-days">
                <div v-for="(day, index) in 7" :key="index" 
                     :class="['streak-day', { active: index < streak % 7 }]"
                     data-aos="zoom-in"
                     :data-aos-delay="index * 50">
                  {{ ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] }}
                </div>
              </div>
              <div class="stat-desc">
                Keep it up!
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <!-- 最近阅读日志 -->
      <el-card class="recent-logs-card" shadow="hover" data-aos="fade-up">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">Recent Reading Log</h3>
            <router-link to="/logs" class="view-all">
              View All
              <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>
        </template>
        
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="logStore.recentLogs.length === 0" class="empty-logs">
          <el-empty description="No Reading Log" />
          <el-button type="primary" @click="$router.push('/logs/create')">
            Create Your First Reading Log
          </el-button>
        </div>
        
        <div v-else class="logs-list">
          <el-table :data="logStore.recentLogs" style="width: 100%" :border="false">
            <el-table-column prop="title" label="Title">
              <template #default="{ row }">
                <router-link :to="`/logs/${row.id}`" class="log-link">
                  {{ row.title }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="Author" width="150" />
            <el-table-column prop="date" label="Reading Date" width="120" />
            <el-table-column prop="duration" label="Duration" width="100">
              <template #default="{ row }">
                {{ row.duration }} Minutes
              </template>
            </el-table-column>
            <el-table-column label="Status" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="add-log">
            <el-button type="primary" @click="$router.push('/logs/create')">
              <el-icon><Plus /></el-icon> Add New Reading Log
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '../store/user'
import { useLogStore } from '../store/log'
import MainLayout from '../layouts/MainLayout.vue'
import { Calendar, Clock, Notebook, ArrowRight, Plus, Trophy, Medal, Star, TrendCharts, Reading } from '@element-plus/icons-vue'
import { useMotion } from '@vueuse/motion'
import gsap from 'gsap'
import AOS from 'aos'
import 'aos/dist/aos.css'

const userStore = useUserStore()
const logStore = useLogStore()

// Status
const loading = ref(true)
const streak = ref(5) // Simulated consecutive reading days
const timeRange = ref('week')

// 动画引用
const userInfoCard = ref(null)
const { motion: userInfoMotion } = useMotion(userInfoCard, {
  initial: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 600 } }
})

// 初始化函数
const initializeAnimations = () => {
  console.log('Initializing animations...')
  
  // 初始化 AOS
  AOS.init({
    duration: 600,
    once: false, // 更改为false，允许重复动画
    offset: 50,
    disable: 'mobile' // 在移动设备上禁用以提高性能
  })
  
  // 确保AOS刷新，识别新元素
  setTimeout(() => {
    AOS.refresh()
  }, 100)

  // GSAP 动画
  gsap.from('.stat-card', {
    opacity: 0,
    y: 30,
    duration: 0.5,
    stagger: 0.15,
    ease: 'power2.out',
    delay: 0.3
  })

  gsap.from('.el-progress-bar__inner', {
    scaleX: 0,
    duration: 1,
    ease: 'power2.out',
    delay: 0.6
  })

  // 数值增长动画 - 使用nextTick确保DOM已更新
  nextTick(() => {
    const elements = {
      readingTime: document.querySelector('.reading-time .stat-value'),
      totalLogs: document.querySelector('.total-logs .stat-value'),
      streak: document.querySelector('.streak-value')
    }

    if (elements.readingTime) {
      const finalTime = logStore.readingTime
      gsap.from(elements.readingTime, {
        innerText: 0,
        duration: 1.5,
        snap: { innerText: 1 },
        ease: 'power1.out',
        delay: 0.3,
        onUpdate: function() {
          elements.readingTime.textContent = formatTime(Math.floor(this.targets()[0].innerText))
        }
      })
    }

    if (elements.totalLogs) {
      gsap.from(elements.totalLogs, {
        innerText: 0,
        duration: 1.5,
        snap: { innerText: 1 },
        ease: 'power1.out',
        delay: 0.3
      })
    }

    if (elements.streak) {
      gsap.from(elements.streak, {
        innerText: 0,
        duration: 1.5,
        snap: { innerText: 1 },
        ease: 'power1.out',
        delay: 0.3
      })
    }
  })
}

// 初始化
onMounted(async () => {
  console.log('Dashboard component mounted')
  
  // 初始化AOS，确保基本动画效果可用
  AOS.init({
    once: false,
    mirror: true
  })
  
  try {
    await logStore.fetchLogs()
    
    // Override mock data with English titles and authors if "阅读日志" titles are found
    if (logStore.logs.some(log => log.title.includes('阅读日志'))) {
      const englishTitles = [
        "To Kill a Mockingbird", 
        "1984", 
        "Pride and Prejudice",
        "The Great Gatsby"
      ];
      
      const englishAuthors = [
        "Harper Lee",
        "George Orwell",
        "Jane Austen",
        "F. Scott Fitzgerald"
      ];
      
      // Replace Chinese titles and authors with English ones
      logStore.logs = logStore.logs.map((log, index) => ({
        ...log,
        title: englishTitles[index % englishTitles.length],
        author: englishAuthors[index % englishAuthors.length]
      }));
    }
  } finally {
    loading.value = false
    
    // 使用多层nextTick和setTimeout确保DOM完全渲染后再初始化动画
    nextTick(() => {
      setTimeout(() => {
        initializeAnimations()
        
        // 额外的AOS刷新，确保所有元素都被识别
        setTimeout(() => {
          AOS.refresh()
        }, 200)
      }, 100)
    })
  }
})

// Computed properties
const joinDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Format time (minutes to hours and minutes)
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours} Hours${mins > 0 ? mins + ' Minutes' : ''}`
  }
  
  return `${mins} Minutes`
}

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
    pending: 'Reviewing',
    rejected: 'Rejected'
  }
  return map[status] || 'Unknown'
}
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  visibility: visible !important; /* 确保仪表板内容始终可见 */
  opacity: 1 !important; /* 确保仪表板内容始终可见 */
}

/* 确保AOS动画不会影响内容可见性 */
[data-aos] {
  opacity: 1 !important;
  transform: none !important;
  transition: none !important;
}

[data-aos].aos-animate {
  opacity: 1 !important;
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

.user-info-card {
  margin-bottom: 24px;
  border: none;
  background: linear-gradient(to right, #ffffff, #f8f9fa);
}

.user-info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  background: linear-gradient(to right, #ffffff, #f0f2f5);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 20px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.user-since {
  color: var(--text-secondary);
  margin: 0;
}

.stats-container {
  margin-bottom: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s ease;
  background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  border: none;
  opacity: 1 !important;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  background: linear-gradient(to bottom right, #ffffff, #f0f2f5);
}

.card-header {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 8px;
  margin-bottom: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-content {
  text-align: center;
  padding: 15px 16px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 10px;
  margin-top: 5px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.stat-desc {
  color: var(--el-text-color-secondary);
  margin-top: 15px;
  font-size: 14px;
}

.streak-days {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.streak-day {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background-color: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
}

.streak-day.active {
  background-color: var(--el-color-primary);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.3);
}

.recent-logs-card {
  margin-bottom: 24px;
}

.view-all {
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-size: 14px;
  text-decoration: none;
}

.view-all .el-icon {
  margin-left: 5px;
}

.loading-container {
  padding: 20px 0;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
}

.empty-logs .el-button {
  margin-top: 20px;
}

.log-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.log-link:hover {
  color: var(--el-color-primary);
}

.add-log {
  margin-top: 20px;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 200px;
  }
}

.reading-overview {
  margin-bottom: 32px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.overview-card {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-lighter);
  opacity: 1 !important; /* 确保卡片始终可见 */
  transform: none !important; /* 防止transform影响布局 */
}

.overview-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, #ffffff, #f0f2f5);
}

.card-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  background: rgba(var(--el-color-primary-rgb), 0.1);
  padding: 12px;
  border-radius: 12px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
  transition: all 0.3s ease;
}

.achievement .el-icon {
  color: var(--el-color-warning);
}

.trend-chart {
  height: 100px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.chart-bar {
  flex: 1;
  background: var(--el-color-primary);
  border-radius: 4px;
  transition: height 1s ease;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style> 