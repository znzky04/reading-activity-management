<template>
  <MainLayout>
    <!-- 顶部 Banner / Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">记录阅读，分享成长</h1>
        <p class="hero-subtitle">专业的阅读活动管理系统，让您的阅读更有价值</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/auth')">开始记录</el-button>
          <el-button size="large" plain>了解更多</el-button>
        </div>
      </div>
      <div class="hero-image">
        <img src="../assets/hero-image.svg" alt="阅读管理" />
      </div>
    </section>
    
    <!-- 功能特点 -->
    <section class="features">
      <h2 class="section-title">核心功能</h2>
      
      <div class="feature-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index">
          <el-icon :size="36" class="feature-icon">
            <component :is="feature.icon"></component>
          </el-icon>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.description }}</p>
        </div>
      </div>
    </section>
    
    <!-- 系统数据概览 -->
    <section class="stats">
      <h2 class="section-title">平台数据</h2>
      
      <div class="stats-grid">
        <div class="stat-card" v-for="(stat, index) in stats" :key="index">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>
    
    <!-- 开始使用 CTA -->
    <section class="cta">
      <h2 class="cta-title">立即开始您的阅读之旅</h2>
      <p class="cta-desc">加入我们，记录每一次阅读，分享每一步成长</p>
      <el-button type="primary" size="large" @click="$router.push('/auth')">免费注册</el-button>
    </section>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { Document, Reading, DataAnalysis, Timer, User, Share } from '@element-plus/icons-vue'

// 功能特点数据
const features = ref([
  {
    icon: 'Document',
    title: '阅读日志',
    description: '记录您的阅读笔记、心得体会，永久保存您的思考'
  },
  {
    icon: 'Timer',
    title: '时间统计',
    description: '自动统计阅读时长，量化您的阅读习惯'
  },
  {
    icon: 'DataAnalysis',
    title: '数据分析',
    description: '可视化展示阅读数据，帮助您了解自己的阅读模式'
  },
  {
    icon: 'Reading',
    title: '阅读规划',
    description: '制定阅读计划，追踪阅读进度'
  },
  {
    icon: 'Share',
    title: '分享交流',
    description: '与其他读者分享您的见解，获取更多阅读灵感'
  },
  {
    icon: 'User',
    title: '个性化推荐',
    description: '基于您的阅读偏好，推荐适合您的书籍'
  }
])

// 平台数据
const stats = ref([
  { value: '10,000+', label: '注册用户' },
  { value: '50,000+', label: '阅读日志' },
  { value: '100,000+', label: '阅读小时' },
  { value: '5,000+', label: '分享讨论' }
])
</script>

<style scoped>
/* Hero / Banner 样式 */
.hero {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
  border-radius: 12px;
  padding: 60px 40px;
  margin-bottom: 60px;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

/* 功能特点样式 */
.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 40px;
  color: var(--text-primary);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  color: var(--primary-color);
  margin-bottom: 16px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.feature-desc {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 数据统计样式 */
.stats {
  margin-bottom: 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 16px;
}

/* CTA 样式 */
.cta {
  background-color: #4A90E2;
  color: white;
  text-align: center;
  padding: 60px;
  border-radius: 12px;
  margin-bottom: 60px;
}

.cta-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
}

.cta-desc {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-image {
    margin-top: 30px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .cta {
    padding: 40px 20px;
  }
}
</style> 