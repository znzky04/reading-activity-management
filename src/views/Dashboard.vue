<template>
  <MainLayout>
    <div class="dashboard">
      <div class="page-header">
        <h1 class="page-title">我的主页</h1>
        <p class="page-description">欢迎回来，查看您的阅读情况</p>
      </div>
      
      <!-- 用户信息卡片 -->
      <el-card class="user-info-card" shadow="never">
        <div class="user-info">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar"></el-avatar>
          <div class="user-details">
            <h3 class="user-name">{{ userStore.userInfo?.email }}</h3>
            <p class="user-since">加入时间：{{ joinDate }}</p>
          </div>
        </div>
      </el-card>
      
      <!-- 阅读统计卡片 -->
      <div class="stats-row">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><Clock /></el-icon> 阅读时长
              </h3>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ formatTime(logStore.readingTime) }}</div>
            <el-progress
              :percentage="Math.min(100, (logStore.readingTime / 3000) * 100)"
              :format="() => ''"
              :stroke-width="12"
            ></el-progress>
            <div class="stat-desc">
              本月目标: 50小时
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><Notebook /></el-icon> 阅读日志
              </h3>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ logStore.totalLogs }}</div>
            <el-progress
              :percentage="Math.min(100, (logStore.totalLogs / 50) * 100)"
              :format="() => ''"
              :stroke-width="12"
            ></el-progress>
            <div class="stat-desc">
              今年目标: 50篇
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><Calendar /></el-icon> 连续阅读
              </h3>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ streak }} 天</div>
            <div class="streak-days">
              <div v-for="(day, index) in 7" :key="index" 
                   :class="['streak-day', { active: index < streak % 7 }]">
                {{ ['一', '二', '三', '四', '五', '六', '日'][index] }}
              </div>
            </div>
            <div class="stat-desc">
              继续保持！
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 最近阅读日志 -->
      <el-card class="recent-logs-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">最近阅读日志</h3>
            <router-link to="/logs" class="view-all">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>
        </template>
        
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="logStore.recentLogs.length === 0" class="empty-logs">
          <el-empty description="暂无阅读日志" />
          <el-button type="primary" @click="$router.push('/logs/create')">
            记录第一篇阅读日志
          </el-button>
        </div>
        
        <div v-else class="logs-list">
          <el-table :data="logStore.recentLogs" style="width: 100%" :border="false">
            <el-table-column prop="title" label="标题">
              <template #default="{ row }">
                <router-link :to="`/logs/${row.id}`" class="log-link">
                  {{ row.title }}
                </router-link>
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
          </el-table>
          
          <div class="add-log">
            <el-button type="primary" @click="$router.push('/logs/create')">
              <el-icon><Plus /></el-icon> 新增阅读日志
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { useLogStore } from '../store/log'
import MainLayout from '../layouts/MainLayout.vue'
import { Calendar, Clock, Notebook, ArrowRight, Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const logStore = useLogStore()

// 状态
const loading = ref(true)
const streak = ref(5) // 模拟连续阅读天数

// 计算属性
const joinDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// 格式化时间（分钟转为小时和分钟）
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
  }
  
  return `${mins}分钟`
}

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

// 初始化
onMounted(async () => {
  try {
    await logStore.fetchLogs()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  padding-bottom: 40px;
}

.user-info-card {
  margin-bottom: 24px;
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  text-align: center;
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.stat-desc {
  color: var(--text-secondary);
  margin-top: 12px;
  font-size: 14px;
}

.streak-days {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 15px 0;
}

.streak-day {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background-color: #f2f2f2;
  color: var(--text-secondary);
}

.streak-day.active {
  background-color: var(--primary-color);
  color: white;
}

.recent-logs-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.log-link:hover {
  color: var(--primary-color);
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
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style> 