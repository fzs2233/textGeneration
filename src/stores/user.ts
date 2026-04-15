import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getMemberById } from '@/api/member'
import type { Member } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  const memberInfo = ref<Member | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const memberId = ref<string | null>(localStorage.getItem('memberId'))

  const isLoggedIn = computed(() => !!token.value && !!memberId.value)
  const userInfo = computed(() => memberInfo.value)

  // 设置登录信息
  function setLoginInfo(newToken: string, id: string | number) {
    token.value = newToken
    memberId.value = String(id)
    localStorage.setItem('token', newToken)
    localStorage.setItem('memberId', String(id))
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!memberId.value) return null
    try {
      const response = await getMemberById(memberId.value)
      memberInfo.value = response.data
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 退出登录
  function logout() {
    token.value = null
    memberId.value = null
    memberInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('memberId')
  }

  return {
    token,
    memberId,
    memberInfo,
    isLoggedIn,
    userInfo,
    setLoginInfo,
    fetchUserInfo,
    logout
  }
})
