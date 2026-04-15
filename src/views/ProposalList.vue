<template>
  <div class="proposal-list-container">
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
        <div class="list-header">
          <h2 class="page-title">提案列表</h2>
          <el-button type="primary" @click="$router.push('/proposal/create')">
            发布新提案
          </el-button>
        </div>

        <el-tabs v-model="activeTab" class="proposal-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="全部提案" name="all" />
          <el-tab-pane label="进行中" name="active" />
          <el-tab-pane label="已结束" name="ended" />
        </el-tabs>

        <div class="proposal-grid" v-loading="loading">
          <el-card v-for="proposal in proposals" :key="proposal.id" class="proposal-card" shadow="hover">
            <template #header>
              <div class="proposal-header">
                <span class="proposal-title">{{ proposal.title }}</span>
                <el-tag :type="getStatusType(proposal.status)" size="small">
                  {{ getStatusText(proposal.status) }}
                </el-tag>
              </div>
            </template>
            <div class="proposal-content">
              <p class="proposal-desc">{{ proposal.description }}</p>
              <div class="proposal-meta">
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatTime(proposal.createTime) }}
                </span>
              </div>
            </div>
            <div class="proposal-actions">
              <el-button type="primary" size="small" @click="goToVote(proposal.id)"
                v-if="proposal.status === 1">
                参与投票
              </el-button>
              <el-button size="small" @click="viewResult(proposal.id)"
                v-if="proposal.status === 2">
                查看结果
              </el-button>
              <el-button type="danger" size="small" @click="handleEndVote(proposal.id)"
                v-if="proposal.status === 1 && userStore.memberInfo?.roleId === 1">
                结束提案
              </el-button>
            </div>
          </el-card>

          <el-empty v-if="!loading && proposals.length === 0" description="暂无提案" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getProposalList, endVote } from '@/api/proposal'
import type { ProposalListItem } from '@/api/types'
import { ProposalStatus } from '@/api/types'
import { User, ArrowDown, Calendar } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const activeTab = ref('all')
const proposals = ref<ProposalListItem[]>([])

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  await fetchProposals()
})

const fetchProposals = async (tabStatus?: string) => {
  loading.value = true
  try {
    let statusParam: number | undefined
    if (tabStatus === 'active') {
      statusParam = ProposalStatus.ACTIVE
    } else if (tabStatus === 'ended') {
      statusParam = ProposalStatus.ENDED
    }
    const response = await getProposalList(statusParam)
    proposals.value = response.data || []
  } catch (error: any) {
    ElMessage.error('获取提案列表失败')
    proposals.value = []
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: string) => {
  fetchProposals(tab)
}

const getStatusType = (status: number) => {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return 'success'
    case ProposalStatus.ENDED:
      return 'info'
    default:
      return ''
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return '投票中'
    case ProposalStatus.ENDED:
      return '已结束'
    default:
      return '未知'
  }
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleDateString('zh-CN')
}

const goToVote = (id: number) => {
  router.push(`/vote/${id}`)
}

const viewResult = (id: number) => {
  router.push(`/vote/result/${id}`)
}

const handleEndVote = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要结束此提案吗？结束后将无法继续投票。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await endVote(id, Number(userStore.memberId))
    ElMessage.success('提案已结束')
    await fetchProposals(activeTab.value)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '结束提案失败')
    }
  }
}

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
.proposal-list-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f5 100%);
}

.main-layout {
  height: 100%;
  width: 100%;
}

.main-layout :deep(.el-main) {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
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
  width: 100%;
  box-sizing: border-box;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.proposal-tabs {
  margin-bottom: 20px;
}

.proposal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.proposal-card {
  cursor: pointer;
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.proposal-title {
  font-weight: 600;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.proposal-content {
  margin-bottom: 16px;
}

.proposal-desc {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.proposal-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #999;
}

.proposal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>