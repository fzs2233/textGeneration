<template>
  <div class="vote-result-container">
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
        <div class="result-card" v-loading="loading">
          <!-- 提案信息 -->
          <div class="proposal-section">
            <div class="section-header">
              <h2 class="proposal-title">{{ resultData.proposal.title }}</h2>
              <el-tag type="info" size="large">已结束</el-tag>
            </div>
            <p class="proposal-description">{{ resultData.proposal.description }}</p>
            <div class="proposal-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                创建时间：{{ formatTime(resultData.proposal.createTime) }}
              </span>
              <span class="meta-item" v-if="resultData.proposal.endTime">
                <el-icon><Clock /></el-icon>
                结束时间：{{ formatTime(resultData.proposal.endTime) }}
              </span>
              <span class="meta-item">
                <el-icon><Checked /></el-icon>
                {{ resultData.proposal.voteType === 1 ? '单选' : `多选（最多${resultData.proposal.maxChoices}项）` }}
              </span>
              <span class="meta-item">
                <el-icon><Trophy /></el-icon>
                获胜名额：{{ resultData.proposal.winnersCount }} 个
              </span>
            </div>
          </div>

          <!-- 获胜选项 -->
          <div class="winners-section" v-if="resultData.winners && resultData.winners.length > 0">
            <h3 class="section-title">
              <el-icon><Trophy /></el-icon>
              获胜选项
            </h3>
            <div class="winners-grid">
              <div
                v-for="(winner, index) in resultData.winners"
                :key="winner.id"
                class="winner-card"
              >
                <div class="winner-badge">第{{ index + 1 }}名</div>
                <div class="winner-content">
                  <span class="winner-text">{{ winner.optionText }}</span>
                  <span class="winner-votes">{{ winner.voteCount }} 票</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 投票结果详情 -->
          <div class="results-section">
            <h3 class="section-title">
              <el-icon><DataLine /></el-icon>
              投票详情
            </h3>
            <div class="results-list">
              <div
                v-for="(option, index) in sortedResults"
                :key="option.id"
                class="result-item"
                :class="{ 'is-winner': isWinner(option.id) }"
              >
                <div class="result-rank">
                  <span class="rank-number">{{ index + 1 }}</span>
                </div>
                <div class="result-info">
                  <div class="result-header">
                    <span class="option-text">{{ option.optionText }}</span>
                    <span class="vote-count">{{ option.voteCount }} 票</span>
                  </div>
                  <el-progress
                    :percentage="getPercentage(option.voteCount)"
                    :stroke-width="12"
                    :color="isWinner(option.id) ? '#67c23a' : '#409eff'"
                  />
                </div>
                <div class="winner-mark" v-if="isWinner(option.id)">
                  <el-icon><Select /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-value">{{ totalVotes }}</div>
              <div class="stat-label">总投票数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ resultData.results.length }}</div>
              <div class="stat-label">选项数量</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ resultData.proposal.voteType === 1 ? '单选' : '多选' }}</div>
              <div class="stat-label">投票类型</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ resultData.proposal.winnersCount }}</div>
              <div class="stat-label">获胜名额</div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-section">
            <el-button @click="router.push('/proposal/list')">
              <el-icon><Back /></el-icon>
              返回列表
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, ArrowDown, Calendar, Clock, Checked, Trophy, DataLine, Back, Select } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getVoteResult } from '@/api/proposal'
import type { VoteResult } from '@/api/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)

const resultData = reactive<VoteResult>({
  proposal: {
    id: 0,
    title: '加载中...',
    description: '',
    proposerId: 0,
    voteType: 1,
    maxChoices: 1,
    winnersCount: 1,
    status: 2,
    startTime: '',
    endTime: null,
    createTime: ''
  },
  winners: [],
  results: []
})

// 计算总投票数
const totalVotes = computed(() => {
  return resultData.results.reduce((sum, option) => sum + option.voteCount, 0)
})

// 按票数排序的结果
const sortedResults = computed(() => {
  return [...resultData.results].sort((a, b) => b.voteCount - a.voteCount)
})

// 判断是否为获胜选项
const isWinner = (optionId: number) => {
  return resultData.winners.some(w => w.id === optionId)
}

// 计算百分比
const getPercentage = (voteCount: number) => {
  if (totalVotes.value === 0) return 0
  return Math.round((voteCount / totalVotes.value) * 100)
}

// 格式化时间
const formatTime = (time: string | null) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取投票结果
onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  const proposalId = route.params.id as string
  if (proposalId) {
    loading.value = true
    try {
      const response = await getVoteResult(Number(proposalId))
      if (response.data) {
        Object.assign(resultData, response.data)
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取投票结果失败')
    } finally {
      loading.value = false
    }
  }
})

// 处理下拉菜单命令
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
.vote-result-container {
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
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.result-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 32px;
}

/* 提案信息区域 */
.proposal-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.proposal-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.proposal-description {
  font-size: 1rem;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
}

.proposal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #909399;
}

/* 获胜选项区域 */
.winners-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.section-title .el-icon {
  color: #e6a23c;
}

.winners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.winner-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fef9e7 0%, #fdf6e3 100%);
  border: 2px solid #f1c40f;
  border-radius: 12px;
  padding: 16px 20px;
}

.winner-badge {
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  margin-right: 16px;
  white-space: nowrap;
}

.winner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 16px;
}

.winner-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
}

.winner-votes {
  font-size: 1rem;
  font-weight: 600;
  color: #67c23a;
  white-space: nowrap;
}

/* 投票结果列表 */
.results-section {
  margin-bottom: 32px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.result-item:hover {
  background: #f5f7fa;
}

.result-item.is-winner {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-color: #67c23a;
}

.result-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e4e7ed;
  border-radius: 50%;
  flex-shrink: 0;
}

.result-item.is-winner .result-rank {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.rank-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: #606266;
}

.result-item.is-winner .rank-number {
  color: white;
}

.result-info {
  flex: 1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.option-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #303133;
}

.vote-count {
  font-size: 0.9rem;
  font-weight: 500;
  color: #909399;
}

.winner-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #67c23a;
  font-size: 1.2rem;
}

/* 统计信息 */
.stats-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #909399;
}

/* 操作按钮 */
.action-section {
  display: flex;
  justify-content: center;
}
</style>
