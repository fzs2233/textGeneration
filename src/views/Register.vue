<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="card-title">创建账户</h2>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        class="register-form"
        size="large"
      >
        <el-form-item prop="username" label="用户名">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword" label="确认密码">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="realName" label="真实姓名">
          <el-input
            v-model="registerForm.realName"
            placeholder="请输入真实姓名"
            prefix-icon="UserFilled"
          />
        </el-form-item>

        <el-form-item prop="email" label="邮箱">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="phone" label="电话">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入电话号码"
            prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="login-link">
          <span>已经有账户？</span>
          <el-button type="primary" link @click="goToLogin">去登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { register } from '@/api/member'
import type { RegisterRequest } from '@/api/types'

const router = useRouter()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)

interface RegisterFormData {
  username: string
  password: string
  confirmPassword: string
  realName: string
  email: string
  phone: string
}

const registerForm = reactive<RegisterFormData>({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  email: '',
  phone: ''
})

// 自定义密码确认校验规则
const validateConfirmPassword = (rule: any, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 邮箱格式校验
const validateEmail = (rule: any, value: string, callback: (error?: Error) => void) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (value === '') {
    callback(new Error('请输入邮箱'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

// 电话格式校验
const validatePhone = (rule: any, value: string, callback: (error?: Error) => void) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (value === '') {
    callback(new Error('请输入电话号码'))
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await register({
          username: registerForm.username,
          password: registerForm.password,
          realName: registerForm.realName,
          email: registerForm.email,
          phone: registerForm.phone
        })
        ElMessage.success('注册成功')
        router.push('/login')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '注册失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f5 100%);
}

.register-card {
  width: 45%;
  max-width: 500px;
  min-width: 320px;
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

.register-form {
  width: 100%;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

.register-form :deep(.el-form-item__label) {
  font-size: 0.95rem;
  font-weight: 500;
}

.register-form :deep(.el-input__inner) {
  font-size: 1rem;
}

.register-form :deep(.el-form-item__error) {
  position: relative;
  top: 0;
  left: 0;
  padding-top: 4px;
  line-height: 1.4;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #666;
}

.login-link :deep(.el-button) {
  font-size: 0.95rem;
  margin-left: 0.25rem;
}
</style>
