<template>
  <div class="login-container">
    <!-- 左侧介绍区域 -->
    <div class="intro-section">
      <h1 class="intro-title">欢迎！</h1>
      <p class="intro-text">本系统为fbszzzz软件包功能点展示与测试系统，登录以继续使用系统</p>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-section">
      <div class="login-card">
        <h2 class="card-title">登录</h2>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          class="login-form"
          size="large"
        >
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>

          <div class="forgot-link">
            <el-button type="primary" link @click="handleForgotPassword"> 忘记密码？ </el-button>
          </div>

          <el-divider />

          <el-button class="register-btn" @click="goToRegister"> 创建新账号 </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/member'
import type { LoginRequest } from '@/api/types'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginRequest>({
  username: '',
  password: '',
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await login(loginForm)
        ElMessage.success('登录成功')
        // 存储 token 和用户信息
        const { token, memberId } = response.data
        if (token) {
          localStorage.setItem('token', token)
        }
        if (memberId) {
          localStorage.setItem('memberId', String(memberId))
          userStore.setLoginInfo(token || '', memberId)
        }
        router.push('/home')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleForgotPassword = () => {
  ElMessage({
    message: '请联系管理员重置密码',
    type: 'info',
    duration: 3000,
    customClass: 'forgot-message',
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f5 100%);
}

.intro-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f5 100%);
}

.intro-title {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
}

.intro-text {
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  color: #666;
  margin: 0.5rem 0;
}

.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f5 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
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

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

.login-form :deep(.el-input__inner) {
  font-size: 1rem;
}

.login-form :deep(.el-form-item__error) {
  position: relative;
  top: 0;
  left: 0;
  padding-top: 4px;
  line-height: 1.4;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 1rem;
}

.forgot-link {
  text-align: center;
  margin-bottom: 0.5rem;
}

.forgot-link :deep(.el-button) {
  font-size: 0.95rem;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 1rem;
}

:deep(.forgot-message) {
  font-size: 1rem !important;
}
</style>
