<template>
  <MainLayout>
    <!-- 顶部 Banner / Hero Section -->
    <section class="hero">
      <div class="hero-content" ref="heroContent" v-motion>
        <h1 class="hero-title">Record Reading, Share Growth</h1>
        <p class="hero-subtitle">Professional Reading Activity Management System, Make Your Reading More Valuable</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/auth')" 
            v-motion="{ hover: { scale: 1.1 } }">Start Recording</el-button>
          <el-button size="large" plain 
            v-motion="{ hover: { scale: 1.1 } }">Learn More</el-button>
        </div>
      </div>
      <div class="hero-image" ref="heroImage" v-motion>
        <img src="../assets/hero-image.svg" alt="Reading Management" />
      </div>
    </section>
    
    <!-- 功能特点 -->
    <section class="features">
      <h2 class="section-title" data-aos="fade-up">Core Features</h2>
      
      <div class="feature-grid">
        <div class="feature-card" 
          v-for="(feature, index) in features" 
          :key="index"
          data-aos="fade-up"
          :data-aos-delay="index * 100">
          <el-icon :size="36" class="feature-icon">
            <component :is="feature.icon"></component>
          </el-icon>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.description }}</p>
        </div>
      </div>
    </section>
    
    <!-- 系统数据概览 -->
    <section class="stats" data-aos="fade-up">
      <h2 class="section-title">Platform Data</h2>
      
      <div class="stats-grid">
        <div class="stat-card" 
          v-for="(stat, index) in stats" 
          :key="index"
          data-aos="zoom-in"
          :data-aos-delay="index * 100">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>
    
    <!-- 开始使用 CTA -->
    <section class="cta" data-aos="fade-up">
      <h2 class="cta-title">Start Your Reading Journey</h2>
      <p class="cta-desc">Join Us, Record Every Reading, Share Every Step of Growth</p>
      <el-button type="primary" size="large" 
        @click="$router.push('/auth')"
        v-motion="{ hover: { scale: 1.1 } }">Free Registration</el-button>
    </section>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { Document, Reading, DataAnalysis, Timer, User, Share } from '@element-plus/icons-vue'
import { useMotion } from '@vueuse/motion'
import gsap from 'gsap'
import AOS from 'aos'
import 'aos/dist/aos.css'

// 初始化 AOS
onMounted(() => {
  AOS.init({
    duration: 1000,
    once: true
  })
})

// Hero 动画
const heroContent = ref(null)
const heroImage = ref(null)

// VueUse Motion 动画
const { motion: heroMotion } = useMotion(heroContent, {
  initial: { opacity: 0, x: -50 },
  enter: { opacity: 1, x: 0, transition: { duration: 800 } }
})

const { motion: imageMotion } = useMotion(heroImage, {
  initial: { opacity: 0, x: 50 },
  enter: { opacity: 1, x: 0, transition: { duration: 800 } }
})

// GSAP 动画
onMounted(() => {
  gsap.from('.stat-value', {
    textContent: 0,
    duration: 2,
    ease: 'power1.out',
    snap: { textContent: 1 },
    stagger: 0.2
  })
})

// 功能特点数据
const features = ref([
  {
    icon: 'Document',
    title: 'Reading Log',
    description: 'Record Your Reading Notes, Thoughts, and Experiences Forever'
  },
  {
    icon: 'Timer',
    title: 'Time Statistics',
    description: 'Automatically Track Reading Time and Quantify Your Reading Habits'
  },
  {
    icon: 'DataAnalysis',
    title: 'Data Analysis',
    description: 'Visualize Reading Data to Help You Understand Your Reading Patterns'
  },
  {
    icon: 'Reading',
    title: 'Reading Planning',
    description: 'Create Reading Plans and Track Reading Progress'
  },
  {
    icon: 'Share',
    title: 'Sharing and Discussion',
    description: 'Share Your Insights with Other Readers and Get More Reading Inspiration'
  },
  {
    icon: 'User',
    title: 'Personalized Recommendation',
    description: 'Recommend Books Suitable for You Based on Your Reading Preferences'
  }
])

// 平台数据
const stats = ref([
  { value: '10,000+', label: 'Registered Users' },
  { value: '50,000+', label: 'Reading Logs' },
  { value: '100,000+', label: 'Reading Hours' },
  { value: '5,000+', label: 'Sharing Discussions' }
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
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.feature-icon {
  color: var(--primary-color);
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.2);
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
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
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
  transition: all 0.3s ease;
}

.cta:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(74,144,226,0.3);
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