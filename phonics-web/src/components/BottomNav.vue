<template>
  <div class="bottom-nav">
    <router-link
        v-for="item in navItems"
        :key="item.text"
        :to="itemTo(item)"
        :class="['nav-item', { active: isActive(item) }]"
        @click.native.prevent="handleClick(item)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-text">{{ item.text }}</span>
    </router-link>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import {onMounted, ref, watch} from "vue";

const route = useRoute()
const router = useRouter()

const currentSymbol = ref('æ') // 默认值

// 从localStorage获取最后访问的音标
const updateCurrentSymbol = () => {
  if (route.name === 'PhonicDetail') {
    currentSymbol.value = decodeURIComponent(route.params.symbol)
  } else {
    const lastPath = localStorage.getItem('lastPhonicDetail')
    if (lastPath) {
      const match = lastPath.match(/\/phonic\/([^\/]+)/)
      if (match && match[1]) {
        currentSymbol.value = decodeURIComponent(match[1])
      }
    }
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateCurrentSymbol()
})

onMounted(() => {
  updateCurrentSymbol()
})

const navItems = [
  { text: '音标表', icon: '🔤', path: '/phonic' },
  { text: '当前音标', icon: currentSymbol, path: null },
  { text: '练习', icon: '📝', path: '/practice' },
  { text: '设置', icon: '⚙️', path: '/settings' }
]

const isActive = (item) => {
  if (item.text === '当前音标') {
    return route.name === 'PhonicDetail'
  }
  return route.path === item.path
}

// 生成 router-link to
const itemTo = (item) => {
  if (item.text === '当前音标') {
    const last = localStorage.getItem('lastPhonicDetail')
    return last || '/phonic'
  }
  return item.path
}

// 点击处理
const handleClick = (item) => {
  if (item.text === '当前音标') {
    const last = localStorage.getItem('lastPhonicDetail')
    if (last) {
      router.push(last)
    }
    return false // 阻止默认跳转
  }
}
</script>


<style scoped>
.bottom-nav {
  flex-shrink: 0;
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: rgba(76, 175, 80, 0.7);
  padding: 8px 0;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
  width: 100%;
  z-index: 1000;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 66px;
  width: 25%;
  color: white;
  text-decoration: none;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  width: 66px;
  transition: 0.4s;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
</style>
