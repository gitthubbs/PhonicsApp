import { createRouter, createWebHistory } from 'vue-router'
import PhonicChart from '../views/PhonicChart.vue'

const routes = [
  { path: '/', redirect: '/phonic' },
  { path: '/phonic', component: PhonicChart },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
