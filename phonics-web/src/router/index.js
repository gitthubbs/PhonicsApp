import { createRouter, createWebHistory } from 'vue-router'
import PhonicChart from '../views/PhonicChart.vue'
import PhonicDetail from '../views/PhonicDetail.vue'

const routes = [
  { path: '/', redirect: '/phonic' },
  { path: '/phonic', component: PhonicChart },
  {
    path: '/phonic/:symbol',
    name: 'PhonicDetail',
    component: PhonicDetail,
    props: true   // 让路由参数作为 props 传入组件
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
