import { createRouter, createWebHistory } from 'vue-router'
import PhonicChart from '../views/PhonicChart.vue'
import PhonicDetail from '../views/PhonicDetail.vue'

const routes = [
  { path: '/', redirect: '/phonic' },
  {
    path: '/phonic',
    name: 'PhonicChart',
    component: PhonicChart,
    meta: {
      transition: 'slide-right' // 从详情返回图表使用右滑动画
    }
  },
  {
    path: '/phonic/:symbol',
    name: 'PhonicDetail',
    component: PhonicDetail,
    meta: {
      transition:  'slide-left' // 从图表到详情使用左滑动画
    },
    props: true   // 让路由参数作为 props 传入组件
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
