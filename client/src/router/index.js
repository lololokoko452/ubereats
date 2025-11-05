import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import LoginView from '@/views/LoginView.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/restaurants/:slug',
    name: 'restaurant',
    component: () => import('@/views/RestaurantDetailView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthed = store.getters['auth/isAuthenticated']
  if (to.matched.some(r => r.meta.requiresAuth) && !isAuthed) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && isAuthed) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
