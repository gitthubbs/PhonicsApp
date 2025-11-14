<template>
  <div class="app-container">
    <!-- 滚动内容 -->
    <div class="scrollable-content" ref="scrollable">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </div>

    <!-- 固定底部导航 -->
    <div class="bottom-nav">
      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { routeOrder } from './router/index.js';
import { TTSService } from '@/services/ttsService.js';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
const transitionName = ref('slide-left');
const scrollable = ref(null);

let lastPageOrder = null;

// 动态计算内容高度
function adjustContentHeight() {
  const vh = window.innerHeight;
  const bottomNav = 82; // 你底部 nav 的固定高度，单位 px
  if (scrollable.value) {
    scrollable.value.style.height = `${vh - bottomNav}px`;
  }
}

watch(
    () => route.name,
    (newName, oldName) => {
      if (!oldName) {
        lastPageOrder = routeOrder[newName] ?? 0;
        return;
      }
      const oldOrder = routeOrder[oldName] ?? 0;
      const newOrder = routeOrder[newName] ?? 0;
      transitionName.value = newOrder > oldOrder ? 'slide-left' : 'slide-right';
      lastPageOrder = newOrder;
    }
);

onMounted(async () => {
  await TTSService.preloadTTS('en-GB');
  scrollable.value = document.querySelector('.scrollable-content');

  adjustContentHeight();
  window.addEventListener('resize', adjustContentHeight);

  watch(
      () => route.fullPath,
      () => {
        scrollable.value.scrollTop = 0;
      },
      { immediate: true }
  );
});
</script>

<style>
html, body, #app {
  height: 100%;
  width:100%;
  margin: 0 auto;
  max-width: 530px;
  padding: 0;
  overflow: hidden; /* 禁止整个页面滚动 */
}

.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  height: 100%;
  margin: 0 auto;
  background: #E5FFE5FF;
}

/* 滚动区域 */
.scrollable-content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
  scroll-behavior: smooth;
}

/* 底部固定导航 */
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 auto;
  max-width: 530px;
  height: 82px; /* 固定高度 */
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
  z-index: 1000;
}
</style>
