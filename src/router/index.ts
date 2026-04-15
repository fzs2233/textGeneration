import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/proposal/create',
      name: 'proposal-create',
      component: () => import('@/views/ProposalCreate.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/proposal/list',
      name: 'proposal-list',
      component: () => import('@/views/ProposalList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vote/:id',
      name: 'vote',
      component: () => import('@/views/Vote.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vote/result/:id',
      name: 'vote-result',
      component: () => import('@/views/VoteResult.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (!to.meta.requiresAuth && isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    // 已登录但访问登录/注册页，跳转到首页
    next('/home')
  } else {
    next()
  }
})

export default router
