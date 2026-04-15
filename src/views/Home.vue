<template>
  <div class="home-container">
    <el-container class="main-layout">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="logo">提案投票系统</div>
        <div class="nav-menu">
          <el-menu mode="horizontal" :ellipsis="false" router>
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/proposal/list">提案列表</el-menu-item>
            <el-menu-item index="/proposal/create">发布提案</el-menu-item>
          </el-menu>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-icon><User /></el-icon>
              <span class="username">{{ userStore.userInfo?.realName || '用户' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <div class="welcome-section">
          <h1 class="welcome-title">欢迎来到提案投票系统</h1>
          <p class="welcome-desc">在这里，您可以发布提案、参与投票，共同决策重要事项</p>
        </div>

        <div class="feature-cards">
          <el-card class="feature-card" shadow="hover" @click="$router.push('/proposal/list')">
            <template #header>
              <div class="card-header">
                <el-icon class="card-icon"><Document /></el-icon>
                <span>提案列表</span>
              </div>
            </template>
            <p>查看所有提案，参与投票表达您的意见</p>
          </el-card>

          <el-card class="feature-card" shadow="hover" @click="$router.push('/proposal/create')">
            <template #header>
              <div class="card-header">
                <el-icon class="card-icon"><Edit /></el-icon>
                <span>发布提案</span>
              </div>
            </template>
            <p>创建新的提案，发起投票征集意见</p>
          </el-card>

          <el-card class="feature-card" shadow="hover" @click="$router.push('/profile')">
            <template #header>
              <div class="card-header">
                <el-icon class="card-icon"><User /></el-icon>
                <span>个人中心</span>
              </div>
            </template>
            <p>查看和修改您的个人信息</p>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, ArrowDown, Document, Edit } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
})

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f5 100%);
}

.main-layout {
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 600;
  color: #409eff;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu :deep(.el-menu) {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #333;
}

.username {
  margin: 0 4px;
  font-weight: 500;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.welcome-desc {
  font-size: 1.1rem;
  color: #666;
}

.feature-cards {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1200px;
}

.feature-card {
  width: 300px;
  cursor: pointer;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 500;
}

.card-icon {
  font-size: 1.25rem;
  color: #409eff;
}

.feature-card p {
  color: #666;
  margin: 0;
}
</style>
