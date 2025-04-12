<template>
  <div class="admin-dashboard">
    <div class="container">
      <h1 class="page-title">管理员控制台</h1>
      
      <div class="dashboard-cards">
        <!-- 核心数据卡片 -->
        <div class="data-card">
          <div class="card-icon users-icon">
            <i class="el-icon-user"></i>
          </div>
          <div class="card-content">
            <h3>用户总数</h3>
            <div class="card-value">{{ stats.userCount }}</div>
          </div>
        </div>
        
        <div class="data-card">
          <div class="card-icon logs-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="card-content">
            <h3>日志总数</h3>
            <div class="card-value">{{ stats.logCount }}</div>
          </div>
        </div>
        
        <div class="data-card">
          <div class="card-icon banned-icon">
            <i class="el-icon-remove-outline"></i>
          </div>
          <div class="card-content">
            <h3>已封禁用户</h3>
            <div class="card-value">{{ stats.bannedCount }}</div>
          </div>
        </div>
        
        <div class="data-card">
          <div class="card-icon pending-icon">
            <i class="el-icon-time"></i>
          </div>
          <div class="card-content">
            <h3>待审核日志</h3>
            <div class="card-value">{{ stats.pendingCount }}</div>
          </div>
        </div>
      </div>
      
      <!-- 近期活动图表 -->
      <div class="chart-section">
        <h2 class="section-title">近期活动</h2>
        <div class="charts-container">
          <div class="chart-card">
            <h3>新增用户趋势</h3>
            <div class="chart-placeholder">
              <!-- 实际项目中这里可以集成 ECharts 等图表库 -->
              <div class="placeholder-stats">
                <div class="stat-bar" v-for="(value, index) in userTrend" :key="index" :style="{height: `${value * 3}px`}"></div>
              </div>
              <div class="chart-axis">
                <span v-for="(date, index) in dates" :key="index">{{ date }}</span>
              </div>
            </div>
          </div>
          
          <div class="chart-card">
            <h3>新增日志趋势</h3>
            <div class="chart-placeholder">
              <div class="placeholder-stats">
                <div class="stat-bar log-bar" v-for="(value, index) in logTrend" :key="index" :style="{height: `${value * 3}px`}"></div>
              </div>
              <div class="chart-axis">
                <span v-for="(date, index) in dates" :key="index">{{ date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 快捷入口 -->
      <div class="shortcut-section">
        <h2 class="section-title">快捷入口</h2>
        <div class="shortcut-cards">
          <div class="shortcut-card" @click="navigateTo('/admin/users')">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </div>
          
          <div class="shortcut-card" @click="navigateTo('/admin/reviews')">
            <i class="el-icon-document-checked"></i>
            <span>日志审核</span>
          </div>
          
          <div class="shortcut-card" @click="navigateTo('/admin/feedbacks')">
            <i class="el-icon-chat-line-square"></i>
            <span>用户反馈</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    
    // 统计数据
    const stats = reactive({
      userCount: 0,
      logCount: 0,
      bannedCount: 0,
      pendingCount: 0
    })
    
    // 趋势数据
    const dates = ref(['4/3', '4/4', '4/5', '4/6', '4/7', '4/8', '4/9'])
    const userTrend = ref([5, 8, 12, 7, 10, 15, 9])
    const logTrend = ref([8, 12, 15, 10, 14, 18, 11])
    
    // 模拟获取数据
    onMounted(() => {
      // 模拟API请求
      setTimeout(() => {
        stats.userCount = 256
        stats.logCount = 1024
        stats.bannedCount = 5
        stats.pendingCount = 18
      }, 500)
    })
    
    // 路由导航
    const navigateTo = (path) => {
      router.push(path)
    }
    
    return {
      stats,
      dates,
      userTrend,
      logTrend,
      navigateTo
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

/* 数据卡片 */
.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.data-card {
  flex: 1;
  min-width: 240px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.card-icon i {
  font-size: 28px;
  color: white;
}

.users-icon {
  background-color: #409eff;
}

.logs-icon {
  background-color: #67c23a;
}

.banned-icon {
  background-color: #f56c6c;
}

.pending-icon {
  background-color: #e6a23c;
}

.card-content h3 {
  margin: 0;
  font-size: 16px;
  color: #606266;
  font-weight: normal;
}

.card-value {
  font-size: 32px;
  color: #303133;
  font-weight: bold;
  margin-top: 5px;
}

/* 图表部分 */
.chart-section, .shortcut-section {
  margin-top: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-card {
  flex: 1;
  min-width: 300px;
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #606266;
}

.chart-placeholder {
  height: 200px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  position: relative;
}

.placeholder-stats {
  height: 150px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  justify-content: space-between;
}

.stat-bar {
  width: 30px;
  background-color: #409eff;
  border-radius: 3px 3px 0 0;
}

.log-bar {
  background-color: #67c23a;
}

.chart-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

/* 快捷入口 */
.shortcut-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.shortcut-card {
  flex: 1;
  min-width: 200px;
  height: 120px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.shortcut-card:hover {
  background: #ecf5ff;
  transform: translateY(-5px);
}

.shortcut-card i {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 10px;
}

.shortcut-card span {
  font-size: 16px;
  color: #303133;
}
</style> 