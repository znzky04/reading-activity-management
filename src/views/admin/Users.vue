<template>
  <div class="admin-users">
    <div class="container">
      <h1 class="page-title">用户管理</h1>
      
      <!-- 筛选/搜索区域 -->
      <div class="filter-section">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索邮箱/用户名" 
          clearable
          @clear="handleSearch"
          class="search-input"
        >
          <template #append>
            <el-button @click="handleSearch">
              <i class="el-icon-search"></i>
            </el-button>
          </template>
        </el-input>
        
        <el-select 
          v-model="statusFilter" 
          placeholder="状态筛选" 
          @change="handleSearch"
          class="status-filter"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="正常" value="active"></el-option>
          <el-option label="已封禁" value="banned"></el-option>
        </el-select>
      </div>
      
      <!-- 用户列表表格 -->
      <div class="users-table">
        <el-table 
          :data="usersList" 
          style="width: 100%"
          v-loading="loading"
          border
          stripe
          row-key="id"
        >
          <el-table-column label="头像" width="80">
            <template #default="scope">
              <el-avatar :src="scope.row.avatar" :size="40"></el-avatar>
            </template>
          </el-table-column>
          
          <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
          
          <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
          
          <el-table-column prop="registerDate" label="注册时间" min-width="140"></el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 'active' ? 'success' : 'danger'"
              >
                {{ scope.row.status === 'active' ? '正常' : '已封禁' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="220">
            <template #default="scope">
              <el-button 
                size="small" 
                type="primary" 
                @click="viewUserDetails(scope.row.id)"
              >
                详情
              </el-button>
              
              <el-button 
                size="small" 
                :type="scope.row.status === 'active' ? 'danger' : 'success'"
                @click="toggleUserStatus(scope.row)"
              >
                {{ scope.row.status === 'active' ? '封禁' : '解禁' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalItems"
          >
          </el-pagination>
        </div>
      </div>
      
      <!-- 用户详情对话框 -->
      <el-dialog 
        v-model="userDetailsVisible" 
        title="用户详情" 
        width="600px"
      >
        <div v-if="selectedUser" class="user-details">
          <div class="user-header">
            <el-avatar :src="selectedUser.avatar" :size="80"></el-avatar>
            <div class="user-info">
              <h3>{{ selectedUser.username }}</h3>
              <p>{{ selectedUser.email }}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="item-label">ID：</span>
            <span>{{ selectedUser.id }}</span>
          </div>
          
          <div class="detail-item">
            <span class="item-label">注册时间：</span>
            <span>{{ selectedUser.registerDate }}</span>
          </div>
          
          <div class="detail-item">
            <span class="item-label">最后登录：</span>
            <span>{{ selectedUser.lastLogin }}</span>
          </div>
          
          <div class="detail-item">
            <span class="item-label">阅读日志数：</span>
            <span>{{ selectedUser.logCount }}</span>
          </div>
          
          <div class="detail-item">
            <span class="item-label">状态：</span>
            <el-tag 
              :type="selectedUser.status === 'active' ? 'success' : 'danger'"
            >
              {{ selectedUser.status === 'active' ? '正常' : '已封禁' }}
            </el-tag>
          </div>
          
          <template v-if="selectedUser.status === 'banned'">
            <div class="detail-item">
              <span class="item-label">封禁原因：</span>
              <span>{{ selectedUser.banReason }}</span>
            </div>
            
            <div class="detail-item">
              <span class="item-label">封禁时间：</span>
              <span>{{ selectedUser.banDate }}</span>
            </div>
          </template>
          
          <div class="user-logs">
            <h4>最近阅读日志</h4>
            <el-table :data="selectedUser.recentLogs" style="width: 100%" size="small">
              <el-table-column prop="title" label="标题" min-width="150"></el-table-column>
              <el-table-column prop="date" label="日期" width="100"></el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button 
                    size="mini" 
                    type="text" 
                    @click="viewLog(scope.row.id)"
                  >
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-dialog>
      
      <!-- 封禁用户确认对话框 -->
      <el-dialog 
        v-model="banDialogVisible" 
        title="封禁用户" 
        width="500px"
      >
        <div class="ban-dialog">
          <p>您确定要封禁用户 <strong>{{ banUser?.username }}</strong> 吗？</p>
          
          <el-form :model="banForm" :rules="banRules" ref="banFormRef" label-width="80px">
            <el-form-item label="封禁原因" prop="reason">
              <el-input 
                type="textarea" 
                v-model="banForm.reason"
                :rows="3"
                placeholder="请输入封禁原因"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <template #footer>
          <el-button @click="banDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBanUser">确认封禁</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminUsers',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    
    // 搜索和筛选
    const searchQuery = ref('')
    const statusFilter = ref('')
    
    // 分页
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalItems = ref(0)
    
    // 用户列表
    const usersList = ref([])
    
    // 用户详情
    const userDetailsVisible = ref(false)
    const selectedUser = ref(null)
    
    // 封禁用户
    const banDialogVisible = ref(false)
    const banUser = ref(null)
    const banFormRef = ref(null)
    const banForm = reactive({
      reason: ''
    })
    const banRules = {
      reason: [
        { required: true, message: '请输入封禁原因', trigger: 'blur' },
        { min: 5, message: '封禁原因至少5个字符', trigger: 'blur' }
      ]
    }
    
    // 加载用户列表
    const loadUsersList = () => {
      loading.value = true
      
      // 模拟API请求
      setTimeout(() => {
        // 模拟的数据
        usersList.value = [
          {
            id: 1,
            username: '张三',
            email: 'zhangsan@example.com',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            registerDate: '2023-03-15',
            lastLogin: '2023-04-08 14:30:25',
            status: 'active',
            logCount: 12,
            recentLogs: [
              { id: 101, title: '《三体》读后感', date: '2023-04-05' },
              { id: 98, title: '《百年孤独》笔记', date: '2023-04-01' }
            ]
          },
          {
            id: 2,
            username: '李四',
            email: 'lisi@example.com',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            registerDate: '2023-03-10',
            lastLogin: '2023-04-07 09:15:40',
            status: 'active',
            logCount: 8,
            recentLogs: [
              { id: 95, title: '《红楼梦》读书笔记', date: '2023-04-02' }
            ]
          },
          {
            id: 3,
            username: '王五',
            email: 'wangwu@example.com',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            registerDate: '2023-02-20',
            lastLogin: '2023-04-01 16:45:10',
            status: 'banned',
            banReason: '违反社区规范：发布了不适当的内容',
            banDate: '2023-04-02 10:30:45',
            logCount: 5,
            recentLogs: []
          }
        ]
        
        totalItems.value = 3 // 总用户数
        loading.value = false
      }, 500)
    }
    
    // 初始化
    onMounted(() => {
      loadUsersList()
    })
    
    // 搜索和筛选处理
    const handleSearch = () => {
      currentPage.value = 1 // 重置为第一页
      loadUsersList()
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      loadUsersList()
    }
    
    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadUsersList()
    }
    
    // 查看用户详情
    const viewUserDetails = (userId) => {
      // 查找用户
      const user = usersList.value.find(u => u.id === userId)
      if (user) {
        selectedUser.value = user
        userDetailsVisible.value = true
      }
    }
    
    // 切换用户状态
    const toggleUserStatus = (user) => {
      if (user.status === 'active') {
        // 封禁用户
        banUser.value = user
        banDialogVisible.value = true
      } else {
        // 解禁用户
        ElMessageBox.confirm(
          `确定要解禁用户 ${user.username} 吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          // 模拟API请求
          setTimeout(() => {
            user.status = 'active'
            ElMessage.success('用户已解禁')
          }, 500)
        }).catch(() => {})
      }
    }
    
    // 确认封禁用户
    const confirmBanUser = async () => {
      if (!banFormRef.value) return
      
      await banFormRef.value.validate((valid) => {
        if (valid) {
          // 模拟API请求
          setTimeout(() => {
            // 更新用户状态
            if (banUser.value) {
              const user = usersList.value.find(u => u.id === banUser.value.id)
              if (user) {
                user.status = 'banned'
                user.banReason = banForm.reason
                user.banDate = new Date().toLocaleString()
              }
            }
            
            banDialogVisible.value = false
            banForm.reason = ''
            ElMessage.success('用户已被封禁')
          }, 500)
        }
      })
    }
    
    // 查看用户日志
    const viewLog = (logId) => {
      router.push(`/logs/${logId}`)
    }
    
    return {
      loading,
      searchQuery,
      statusFilter,
      currentPage,
      pageSize,
      totalItems,
      usersList,
      userDetailsVisible,
      selectedUser,
      banDialogVisible,
      banUser,
      banFormRef,
      banForm,
      banRules,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      viewUserDetails,
      toggleUserStatus,
      confirmBanUser,
      viewLog
    }
  }
}
</script>

<style scoped>
.admin-users {
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

/* 筛选区域 */
.filter-section {
  display: flex;
  margin-bottom: 20px;
  gap: 15px;
}

.search-input {
  max-width: 300px;
}

.status-filter {
  width: 120px;
}

/* 用户表格 */
.users-table {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户详情 */
.user-details {
  padding: 10px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.user-info {
  margin-left: 20px;
}

.user-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #303133;
}

.user-info p {
  margin: 0;
  color: #606266;
}

.detail-item {
  margin-bottom: 10px;
  line-height: 24px;
}

.item-label {
  font-weight: bold;
  color: #606266;
  display: inline-block;
  width: 100px;
}

.user-logs {
  margin-top: 20px;
}

.user-logs h4 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #303133;
}

/* 封禁对话框 */
.ban-dialog p {
  margin-bottom: 15px;
}
</style> 