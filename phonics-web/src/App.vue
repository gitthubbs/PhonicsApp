<script setup>

import {onMounted, onUnmounted, ref, watch} from 'vue';
import { useRoute } from 'vue-router'
import { routeOrder } from './router/index.js'
import { TTSService } from '@/services/ttsService.js';
import BottomNav from '@/components/BottomNav.vue';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
window.capacitor = { Plugins: { TextToSpeech } };

const route = useRoute()
const transitionName = ref('slide-left')
const scrollable =ref(null)

let lastPageOrder = null

function adjustPadding() {

  // Safari/iOS safe area bottom inset
  const safeAreaInsetBottom = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--sat-env-inset-bottom')
  ) || 0;

  scrollable.value.style.paddingBottom = `${safeAreaInsetBottom}px`;
}

watch(
    () => route.name,
    (newName, oldName) => {
      if (!oldName) {
        lastPageOrder = routeOrder[newName] ?? 0
        return
      }

      const oldOrder = routeOrder[oldName] ?? 0
      const newOrder = routeOrder[newName] ?? 0

      // 从左到右 → slide-left
      // 从右到左 → slide-right
      transitionName.value = newOrder > oldOrder ? 'slide-left' : 'slide-right'

      lastPageOrder = newOrder
    }
)

onMounted(async () => {
  await TTSService.preloadTTS('en-GB'); // 英式英语

  scrollable.value = document.querySelector('.scrollable-content');

  if (!scrollable.value) return;

  // 设置 CSS 变量，兼容 Safari 安全区
  document.documentElement.style.setProperty(
      '--sat-env-inset-bottom',
      `${window.innerHeight - document.documentElement.clientHeight}px`
  );

  adjustPadding();
  window.addEventListener('resize', adjustPadding);

  // 每次路由切换时，强制置顶
  watch(
      () => route.fullPath,
      () => {
        scrollable.value.scrollTop = 0;
      },
      { immediate: true } // 页面初次加载也置顶
  );

});

onUnmounted(() => {
  window.removeEventListener('resize', adjustPadding);
});

</script>

<template>
      <div class="app-container">
        <!-- 滚动内容区域 -->
        <div class="scrollable-content">
          <router-view v-slot="{ Component, route }">
            <transition :name="transitionName" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </div>
        <!-- 固定底部导航 -->
        <BottomNav />
      </div>
</template>

<style>

html, body, #app {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  overflow-x: hidden;
  background-color: #E5FFE5FF;
}

.scrollable-content {
  flex: 1 1 auto; /* 占据剩余空间 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: env(safe-area-inset-bottom, 0); /* iOS 安全区 */
  scroll-behavior: auto;
}
</style>
