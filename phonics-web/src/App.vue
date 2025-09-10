<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
      <div class="app-container">
        <router-view />
      </div>
</template>

<style>

html, body, #app {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  justify-content: center;
}

.app-container {
  max-width: 100%;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  max-width: 600px;
  margin: 0 auto;
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
