<template>
  <div class="settings-page">
    <div class="phonic-detail-header">
      <button class="back-button" @click="goBack"><</button>
    </div>
    <h2 class="settings-main">设置</h2>
    <div class="settings-content">
      <div class="setting-item">
        <h3>语速 Rate</h3>
        <input
            type="range"
            min="0.1"
            :max="isSorCWebKit ? 1.0 : 2.0"
            step="0.05"
            :value="store.rate"
            @input="store.setRate($event.target.value)"
        />
        <span>{{ store.rate.toFixed(2) }}</span>
      </div>

      <div class="setting-item">
        <h3>声音 (Voice)</h3>
        <select v-model="store.voiceName" @change="store.setVoice(store.voiceName)" :disabled="isSafari">
          <option v-for="voice in voices.filter(v => v.lang.includes('en-GB') || v.lang.includes('en-US'))"
                  :key="voice.name"
                  :value="voice.name"
          >
            {{ voice.name }} ({{ voice.lang }})
          </option>
        </select>
        <div v-if="isSafari" class="safari-notice">
          现在的环境下只支持一种声音
        </div>
      </div>

      <div class="setting-item">
        <h3>测试语音</h3>
        <div  class="sentence">
          <span>'This is a test of the selected voice settings.'</span>
        </div>
        <button @click="testTTS">播放示例</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import { TTSService } from '@/services/ttsService.js';
import { useTtsStore } from '@/store/ttsStore.js';
import router from "@/router/index.js";

const store = useTtsStore()
const voices = ref([]);
const ttsOptions = ref({
  rate: 0.8,
  pitch: 1.0,
  locale: 'en-GB',
  voiceName: 'Samantha',
});

const isSafari = /(^((?!chrome|android).)*safari|iphone|ipad|ipod)/i.test(navigator.userAgent)
    || /micromessenger/i.test(navigator.userAgent);
const isChrome = /chrome/i.test(navigator.userAgent);
const isSorCWebKit = isSafari || isChrome;

const goBack = () => {
  router.push('/phonic');
};

onMounted(async () => {
  store.loadFromStorage()
  function loadVoices() {
    const list = speechSynthesis.getVoices()
    if (list.length > 0) {
      voices.value = list
      if (!store.voiceName) {
        const defaultVoice = isSafari
            ? list.find(v => v.name === 'Samantha')
            : list.find(v => v.lang.includes(store.locale)) || list[0];
        if (defaultVoice) {
          store.setVoice(defaultVoice.name);
        }
      }
    }
  }

  // 立即尝试加载
  loadVoices()

  // 监听 voice 加载事件（Safari 必须）
  window.speechSynthesis.onvoiceschanged = loadVoices
});

const testTTS = async () => {

  await TTSService.speakWithWebAPI(
      'This is a test of the selected voice settings.',
      {
    rate: store.rate,
    pitch: store.pitch,
    locale: store.locale,
    voiceName: store.voiceName
  });
};
</script>

<style scoped>
.settings-page {
  max-width: 530px;
  padding: 15px 20px;
  margin: 0 auto;
  font-family: 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #E5FFE5FF;
  min-height: calc(100vh - 82px);
  box-sizing: border-box;
}

.phonic-detail-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 2px 1px;
  width: 99.5%;
  margin: 30px 0px 10px 0px;
  background: rgb(75, 174, 80);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 40px;
}

.back-button {
  background: rgba(255,255,255,0.68);
  border: none;
  height: 88%;
  width: 15%;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 4px 7px 4px;
  margin: 6px;
  color: rgba(0, 0, 0, 0.68);
  border-radius: 45px;
}

.settings-main {
  background: #4CAF50;
  color: #fff;
  padding: 20px;
  font-size: 2.0rem;
  text-align: center;
  align-content: space-between;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.settings-content {
  margin-top: 20px;
}

.setting-item {
  margin-bottom: 30px;
}

.setting-item h3 {
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: rgba(0, 0, 0, 0.63);
  border-left: 4px solid #4CAF50;
  padding-left: 8px;
  background: #93c593;
  border-radius: 12px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
}

.setting-item input[type="range"] {
  width: 100%;
}

.sentence {
  background: #fdf5e6;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 30px;
}

.setting-item select {
  width: 100%;
  padding: 4px 6px;
  border-radius: 6px;
}

.setting-item button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.setting-item button:hover {
  background: #45a049;
}

.safari-notice {
  background: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.8rem;
  color: #666;
  margin-top: 6px;
  display: inline-block;
}

select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
