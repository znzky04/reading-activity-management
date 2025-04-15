<template>
  <MainLayout>
    <div class="feedback-page">
      <div class="page-header" data-aos="fade-down">
        <h1 class="page-title">Feedback & Suggestions</h1>
        <p class="page-description">Help us improve the platform with your feedback</p>
      </div>
      
      <div class="feedback-container" data-aos="fade-up">
        <el-card>
          <div class="feedback-types">
            <div 
              v-for="type in feedbackTypes" 
              :key="type.value"
              :class="['feedback-type', { 'active': selectedType === type.value }]"
              @click="selectedType = type.value"
              v-motion="{ hover: { scale: 1.05 } }">
              <el-icon>
                <component :is="type.icon"></component>
              </el-icon>
              <span>{{ type.label }}</span>
            </div>
          </div>

          <div class="feedback-form">
            <el-form ref="feedbackForm" :model="feedbackData" :rules="rules">
              <el-form-item prop="title">
                <el-input 
                  v-model="feedbackData.title" 
                  placeholder="Title (what is this feedback about?)" 
                  maxlength="50" 
                  show-word-limit />
              </el-form-item>

              <el-form-item prop="content">
                <el-input 
                  v-model="feedbackData.content" 
                  type="textarea" 
                  placeholder="Please describe your feedback in detail..." 
                  rows="6"
                  maxlength="500"
                  show-word-limit />
              </el-form-item>

              <el-form-item>
                <el-upload
                  action="/api/upload"
                  list-type="picture-card"
                  :multiple="true"
                  :limit="3"
                  :auto-upload="false">
                  <template #default>
                    <el-icon style="font-size: 18px;"><Plus /></el-icon>
                    <div style="margin-top: 8px; font-size: 12px;">Add screenshots</div>
                  </template>
                </el-upload>
                <p class="upload-tip">Images help us better understand your feedback (up to 3 images, max 5MB each)</p>
              </el-form-item>

              <el-form-item>
                <el-input
                  v-model="feedbackData.contact"
                  placeholder="Contact info (optional)" />
                <p class="contact-tip">
                  Leave your email if you want us to follow up with you
                </p>
              </el-form-item>

              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="submitting"
                  @click="submitFeedback"
                  class="submit-btn">
                  Submit Feedback
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>

      <div class="feedback-faq" data-aos="fade-up">
        <h2>Frequently Asked Questions</h2>
        <el-collapse>
          <el-collapse-item title="When will I receive a response to my feedback?" name="1">
            <div>We typically respond to feedback within 1-3 business days, depending on the nature of your feedback.</div>
          </el-collapse-item>
          <el-collapse-item title="What happens after I submit feedback?" name="2">
            <div>Our team will review your feedback and categorize it based on priority. If it's a bug, we'll add it to our fix list. If it's a feature request, we'll consider it for future releases.</div>
          </el-collapse-item>
          <el-collapse-item title="Can I check the status of my feedback?" name="3">
            <div>Yes! If you provided contact information, we'll keep you updated on the status of your feedback or report.</div>
          </el-collapse-item>
          <el-collapse-item title="How do I report critical issues?" name="4">
            <div>For critical issues that need immediate attention, please select "Bug Report" as the feedback type and clearly mark it as urgent in your title.</div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { QuestionFilled, WarningFilled, StarFilled, BellFilled, Plus } from '@element-plus/icons-vue'
import { useMotion } from '@vueuse/motion'
import { ElMessage } from 'element-plus'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { onMounted } from 'vue'

// Initialize AOS
onMounted(() => {
  AOS.init({
    duration: 800,
    once: true
  })
})

const feedbackTypes = [
  { label: 'Feature Request', value: 'feature', icon: 'StarFilled' },
  { label: 'Bug Report', value: 'bug', icon: 'WarningFilled' },
  { label: 'General Question', value: 'question', icon: 'QuestionFilled' },
  { label: 'Other', value: 'other', icon: 'BellFilled' }
]

const selectedType = ref('feature')
const submitting = ref(false)

const feedbackData = reactive({
  title: '',
  content: '',
  contact: '',
  type: selectedType
})

const rules = {
  title: [
    { required: true, message: 'Please enter a title', trigger: 'blur' },
    { min: 5, message: 'Title should be at least 5 characters', trigger: 'blur' }
  ],
  content: [
    { required: true, message: 'Please enter feedback content', trigger: 'blur' },
    { min: 20, message: 'Content should be at least 20 characters', trigger: 'blur' }
  ]
}

const feedbackForm = ref(null)

const submitFeedback = async () => {
  if (!feedbackForm.value) return
  
  await feedbackForm.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        ElMessage({
          message: 'Thank you for your feedback!',
          type: 'success'
        })
        
        // Reset form
        feedbackData.title = ''
        feedbackData.content = ''
        feedbackData.contact = ''
        
      } catch (error) {
        ElMessage({
          message: 'Failed to submit feedback. Please try again.',
          type: 'error'
        })
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style scoped>
.feedback-page {
  max-width: 800px;
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

.feedback-types {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.feedback-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 110px;
  text-align: center;
  height: 90px;
}

.feedback-type.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.feedback-type i {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--el-color-primary);
}

.upload-tip, .contact-tip {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
  margin-top: 0.5rem;
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
}

.feedback-faq {
  margin-top: 3rem;
}

.feedback-faq h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .feedback-types {
    gap: 0.5rem;
    justify-content: space-between;
  }
  
  .feedback-type {
    width: calc(50% - 0.5rem);
    padding: 0.8rem;
    font-size: 14px;
    height: 80px;
  }
  
  .feedback-type i {
    font-size: 20px;
    margin-bottom: 6px;
  }
}
</style> 