<template>
  <div class="proposal-create-container">
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
        <div class="proposal-card">
          <h2 class="card-title">发布提案</h2>

          <el-form
            ref="proposalFormRef"
            :model="proposalForm"
            :rules="proposalRules"
            label-position="top"
            class="proposal-form"
            size="large"
          >
            <el-form-item prop="title" label="提案标题">
              <el-input v-model="proposalForm.title" placeholder="请输入提案标题" />
            </el-form-item>

            <el-form-item prop="description" label="提案内容">
              <el-input
                v-model="proposalForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入提案内容"
              />
            </el-form-item>

            <el-form-item prop="voteType" label="投票类型">
              <el-radio-group v-model="proposalForm.voteType">
                <el-radio :value="1">单选</el-radio>
                <el-radio :value="2">多选</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="proposalForm.voteType === 2" prop="maxChoices" label="最多选择数">
              <el-input-number v-model="proposalForm.maxChoices" :min="2" :max="10" />
            </el-form-item>

            <el-form-item prop="winnersCount" label="获胜名额数">
              <el-input-number v-model="proposalForm.winnersCount" :min="1" :max="10" />
              <span class="form-tip">投票结束后，票数最多的 {{ proposalForm.winnersCount }} 个选项将获胜</span>
            </el-form-item>

            <el-form-item prop="options" label="投票选项">
              <div class="options-container">
                <div
                  v-for="(option, index) in proposalForm.options"
                  :key="index"
                  class="option-item"
                >
                  <el-input v-model="proposalForm.options[index]" placeholder="请输入选项内容" />
                  <el-button
                    type="danger"
                    :icon="Delete"
                    circle
                    @click="removeOption(index)"
                    v-if="proposalForm.options.length > 2"
                  />
                </div>
                <el-button type="primary" plain @click="addOption" class="add-option-btn">
                  添加选项
                </el-button>
              </div>
            </el-form-item>

            <el-form-item class="button-group">
              <el-button
                type="primary"
                class="action-btn"
                :loading="publishLoading"
                @click="handlePublish"
              >
                发布
              </el-button>
              <el-button type="danger" class="action-btn" @click="handleCancel"> 取消 </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createProposal } from '@/api/proposal'
import type { CreateProposalRequest } from '@/api/types'
import { useUserStore } from '@/stores/user'
import { User, ArrowDown, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const proposalFormRef = ref<FormInstance>()
const publishLoading = ref(false)

interface ProposalFormData extends Omit<CreateProposalRequest, 'options'> {
  options: string[]
}

const proposalForm = reactive<ProposalFormData>({
  title: '',
  description: '',
  voteType: 1,
  maxChoices: 2,
  winnersCount: 1,
  options: ['', ''],
})

const proposalRules: FormRules = {
  title: [{ required: true, message: '请输入提案标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入提案内容', trigger: 'blur' }],
  voteType: [{ required: true, message: '请选择投票类型', trigger: 'change' }],
  options: [
    {
      validator: (rule, value, callback) => {
        const validOptions = value.filter((opt: string) => opt.trim() !== '')
        if (validOptions.length < 2) {
          callback(new Error('请至少填写两个选项'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})

const addOption = () => {
  proposalForm.options.push('')
}

const removeOption = (index: number) => {
  proposalForm.options.splice(index, 1)
}

const handlePublish = async () => {
  if (!proposalFormRef.value) return

  await proposalFormRef.value.validate(async (valid) => {
    if (valid) {
      const validOptions = proposalForm.options.filter((opt) => opt.trim() !== '')

      // 验证获胜名额数必须少于投票选项数
      if (proposalForm.winnersCount >= validOptions.length) {
        ElMessage.error(`获胜名额数必须少于投票选项数（当前有效选项 ${validOptions.length} 个）`)
        return
      }

      publishLoading.value = true
      try {
        await createProposal(
          {
            title: proposalForm.title,
            description: proposalForm.description,
            voteType: proposalForm.voteType,
            maxChoices: proposalForm.voteType === 2 ? proposalForm.maxChoices : 1,
            winnersCount: proposalForm.winnersCount,
            options: validOptions,
          },
          Number(userStore.memberId),
        )
        ElMessage.success('发布成功')
        router.push('/proposal/list')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '发布失败，权限不足，请重试')
      } finally {
        publishLoading.value = false
      }
    }
  })
}

const handleCancel = () => {
  proposalFormRef.value?.resetFields()
  router.push('/proposal/list')
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
.proposal-create-container {
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
  justify-content: center;
  align-items: flex-start;
  padding: 40px 24px;
  overflow-y: auto;
}

.proposal-card {
  width: 60%;
  max-width: 700px;
  min-width: 400px;
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2rem;
}

.proposal-form {
  width: 100%;
}

.proposal-form :deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

.proposal-form :deep(.el-form-item__label) {
  font-size: 0.95rem;
  font-weight: 500;
}

.proposal-form :deep(.el-input__inner) {
  font-size: 1rem;
}

.proposal-form :deep(.el-textarea__inner) {
  font-size: 1rem;
}

.options-container {
  width: 100%;
}

.option-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.option-item .el-input {
  flex: 1;
}

.add-option-btn {
  width: 100%;
  margin-top: 8px;
}

.form-tip {
  margin-left: 12px;
  font-size: 0.85rem;
  color: #909399;
}

.button-group {
  margin-top: 1.5rem;
}

.button-group :deep(.el-form-item__content) {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 100px;
  height: 40px;
  font-size: 0.95rem;
}
</style>
