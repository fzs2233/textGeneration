<template>
  <div class="vote-container">
    <div class="vote-card">
      <h2 class="card-title">提案投票</h2>

      <div class="proposal-info" v-loading="loading">
        <h3 class="proposal-title">{{ proposalData.title }}</h3>
        <p class="proposal-description">{{ proposalData.description }}</p>
        <div class="proposal-tips">
          <span v-if="proposalData.voteType === 2" class="tip-item">
            最多可选 {{ proposalData.maxChoices }} 项
          </span>
          <span class="tip-item">
            获胜名额：{{ proposalData.winnersCount }} 个
          </span>
        </div>
      </div>

      <el-form
        ref="voteFormRef"
        :model="voteForm"
        :rules="voteRules"
        label-position="top"
        class="vote-form"
        size="large"
      >
        <el-form-item prop="optionIds" label="请选择您的投票">
          <el-radio-group v-model="voteForm.optionIds[0]" class="vote-radio-group" v-if="proposalData.voteType === 1">
            <el-radio v-for="option in proposalData.options" :key="option.id" :value="option.id" class="vote-radio">
              <span class="vote-label">{{ option.optionText }}</span>
            </el-radio>
          </el-radio-group>
          <el-checkbox-group v-model="voteForm.optionIds" class="vote-checkbox-group" v-else>
            <el-checkbox v-for="option in proposalData.options" :key="option.id" :value="option.id" class="vote-checkbox">
              {{ option.optionText }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item class="button-group">
          <el-button
            type="primary"
            class="action-btn"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            提交投票
          </el-button>
          <el-button
            class="action-btn"
            @click="handleCancel"
          >
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getProposalDetail, vote } from '@/api/proposal'
import { useUserStore } from '@/stores/user'
import type { ProposalOption, VoteRequest } from '@/api/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const voteFormRef = ref<FormInstance>()
const loading = ref(false)
const submitLoading = ref(false)

interface VoteFormData {
  optionIds: number[]
}

const voteForm = reactive<VoteFormData>({
  optionIds: []
})

const proposalData = reactive({
  id: 0,
  title: '加载中...',
  description: '',
  voteType: 1,
  maxChoices: 1,
  winnersCount: 1,
  options: [] as ProposalOption[]
})

const voteRules: FormRules = {
  optionIds: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请选择投票选项'))
        } else if (proposalData.voteType === 2 && value.filter((id: number | undefined) => id !== undefined).length > proposalData.maxChoices) {
          callback(new Error(`最多只能选择 ${proposalData.maxChoices} 个选项`))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 获取提案详情
onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  const proposalId = route.params.id as string
  if (proposalId) {
    loading.value = true
    try {
      const response = await getProposalDetail(Number(proposalId))
      if (response.data) {
        proposalData.id = response.data.proposal.id
        proposalData.title = response.data.proposal.title
        proposalData.description = response.data.proposal.description
        proposalData.voteType = response.data.proposal.voteType
        proposalData.maxChoices = response.data.proposal.maxChoices
        proposalData.winnersCount = response.data.proposal.winnersCount
        proposalData.options = response.data.options
      }
    } catch (error) {
      ElMessage.error('获取提案详情失败')
    } finally {
      loading.value = false
    }
  }
})

const handleSubmit = async () => {
  if (!voteFormRef.value) return

  await voteFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        let optionIds: number[]
        if (proposalData.voteType === 1) {
          // 单选：取第一个选项
          const selected = voteForm.optionIds[0]
          optionIds = selected !== undefined ? [selected] : []
        } else {
          // 多选：过滤掉 undefined
          optionIds = voteForm.optionIds.filter((id): id is number => id !== undefined)
        }

        await vote(proposalData.id, { optionIds }, Number(userStore.memberId))
        ElMessage.success('投票成功')
        router.push('/proposal/list')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '投票失败，请重试')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.vote-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f5 100%);
}

.vote-card {
  width: 60%;
  height: 80%;
  max-width: 700px;
  min-width: 400px;
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.card-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}

.proposal-info {
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.proposal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.proposal-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.proposal-tips {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.tip-item {
  font-size: 0.85rem;
  color: #909399;
  background: #e8eef5;
  padding: 4px 12px;
  border-radius: 4px;
}

.vote-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.vote-form :deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

.vote-form :deep(.el-form-item__label) {
  font-size: 1rem;
  font-weight: 500;
}

.vote-radio-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vote-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vote-radio {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
  margin: 0;
}

.vote-radio:deep(.el-radio__input.is-checked) + .el-radio__label {
  color: #409eff;
}

.vote-radio:hover {
  border-color: #409eff;
}

.vote-checkbox {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
  margin: 0;
}

.vote-checkbox:hover {
  border-color: #409eff;
}

.vote-label {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.vote-radio :deep(.el-radio__label) {
  color: #333;
  font-size: 1rem;
}

.vote-checkbox :deep(.el-checkbox__label) {
  color: #333;
  font-size: 1rem;
}

.button-group {
  margin-top: auto;
  padding-top: 1rem;
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
