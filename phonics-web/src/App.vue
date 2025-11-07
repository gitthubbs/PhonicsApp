<script setup>

import { onMounted } from 'vue';
import { TTSService } from '@/services/ttsService.js';
import BottomNav from '@/components/BottomNav.vue';

onMounted(async () => {
  await TTSService.preloadTTS('en-GB'); // 英式英语
});


</script>

<template>
      <div class="app-container">
        <router-view v-slot="{ Component, route }">
          <transition :name="route.meta.transition || 'fade'">
            <component :is="Component" />
          </transition>
        </router-view>
        <BottomNav />
      </div>
</template>

<style>

/* 页面切换动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}


html, body, #app {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  justify-content: center;
}

.app-container {
  background-color: #E5FFE5FF;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 82px;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
