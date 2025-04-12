import { defineStore } from 'pinia'

export const useLogStore = defineStore('log', {
  state: () => ({
    logs: [], // 所有日志
    currentLog: null, // 当前查看的日志
    loading: false,
    totalLogs: 0,
    readingTime: 0, // 总阅读时间
  }),
  
  getters: {
    recentLogs: (state) => {
      return [...state.logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
    },
  },
  
  actions: {
    // 模拟获取日志列表
    fetchLogs(params = {}) {
      this.loading = true
      
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          // 生成模拟数据
          const mockLogs = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            title: `阅读日志 ${i + 1}`,
            author: '某某作者',
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], // 日期，每天一个
            duration: Math.floor(Math.random() * 120) + 30, // 30-150分钟随机
            content: `这是第 ${i + 1} 条阅读日志的内容。包含了我的阅读笔记和心得体会...`,
            status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)] // 随机状态
          }))
          
          this.logs = mockLogs
          this.totalLogs = 100 // 假设总共有100条
          this.readingTime = mockLogs.reduce((sum, log) => sum + log.duration, 0)
          this.loading = false
          
          resolve({
            logs: mockLogs,
            total: 100
          })
        }, 500)
      })
    },
    
    // 获取日志详情
    fetchLogDetail(id) {
      this.loading = true
      
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          const log = this.logs.find(l => l.id == id) || {
            id: id,
            title: `阅读日志 ${id}`,
            author: '某某作者',
            date: new Date().toISOString().split('T')[0],
            duration: 60,
            content: '这是一篇详细的阅读笔记，记录了我对某本书的理解和感悟。\n\n包括了对主要情节的分析，对人物的解读，以及我个人的阅读体会。\n\n这本书主要讲述了...',
            status: 'approved'
          }
          
          this.currentLog = log
          this.loading = false
          
          resolve(log)
        }, 300)
      })
    },
    
    // 创建日志
    createLog(logData) {
      this.loading = true
      
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          const newLog = {
            id: this.logs.length + 1,
            ...logData,
            status: 'pending' // 新创建的日志默认为待审核
          }
          
          this.logs.unshift(newLog)
          this.loading = false
          
          resolve(newLog)
        }, 300)
      })
    },
    
    // 更新日志
    updateLog(id, logData) {
      this.loading = true
      
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = this.logs.findIndex(l => l.id == id)
          
          if (index !== -1) {
            const updatedLog = { ...this.logs[index], ...logData }
            this.logs[index] = updatedLog
            
            if (this.currentLog && this.currentLog.id == id) {
              this.currentLog = updatedLog
            }
          }
          
          this.loading = false
          resolve(this.logs[index])
        }, 300)
      })
    },
    
    // 删除日志
    deleteLog(id) {
      this.loading = true
      
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          this.logs = this.logs.filter(log => log.id != id)
          this.loading = false
          
          if (this.currentLog && this.currentLog.id == id) {
            this.currentLog = null
          }
          
          resolve({ success: true })
        }, 300)
      })
    }
  }
}) 