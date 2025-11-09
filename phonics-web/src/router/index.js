import { createRouter, createWebHistory } from 'vue-router'
import PhonicChart from '../views/PhonicChart.vue'
import PhonicDetail from '../views/PhonicDetail.vue'
import Practice from '../views/Practice.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', redirect: '/phonic' },
  {
    path: '/phonic',
    name: 'PhonicChart',
    component: PhonicChart,
  },
  {
    path: '/phonic/:symbol',
    name: 'PhonicDetail',
    component: PhonicDetail,
    props: true   // 让路由参数作为 props 传入组件
  },
  {
    path: '/practice',
    name: 'Practice',
    component: Practice,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const routeOrder = {
  PhonicChart: 0,
  PhonicDetail: 1,
  Practice: 2,
  Settings: 3
}

export default router
