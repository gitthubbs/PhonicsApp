<template>
  <div class="practice-page">

    <div class="phonic-detail-header">
      <button class="back-button" @click="goBack"><</button>
    </div>
    <div class="practice-phonic">
      <button class="phonic-nav-btn left" @click="prevPhonic"><</button>
      <transition name="fade">
      <h1>{{ symbol }}</h1>
      </transition>
      <button class="phonic-nav-btn right" @click="nextPhonic">></button>
    </div>


    <transition name="fade">
    <div class="practice-content" v-if="currentItem">
      <div class="practice-type">单词练习</div>

      <div class="practice-target">
        <h2>{{ currentItem.text }}</h2>
      </div>

      <button class="play-btn" @click="playTTS(currentItem.text)">🔊 播放标准读音</button>

      <div class="record-area">
        <button v-if="!isRecording" @click="startRecording">🎤 开始录音</button>
        <button v-if="isRecording" @click="stopRecording">⏹ 停止录音</button>
      </div>

      <div v-if="score !== null" class="score-panel">
        <div class="score-number" :class="scoreColor">{{ score }}</div>
        <div class="score-bar-wrapper">
          <div class="score-bar-fill" :style="{ width: score + '%' }"></div>
        </div>
        <div class="score-tip">{{ scoreTip }}</div>
      </div>
    </div>
    </transition>

    <button class="next-btn" @click="handleNextClick" ref="nextBtn">下一个</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { phonicsWords } from '@/data/phonicsWords'
import { phonicsSymbols } from '@/data/phonicsWords'
import { TTSService } from '@/services/ttsService'
import router from "@/router/index.js"
import { evaluatePronunciation } from "@/utils/evaluatePronunciation.js"

const route = useRoute()
const symbol = ref('')
const currentItem = ref(null)
const currentIndex = ref(0)
const currentPhonicIndex = ref(-1)

const mediaRecorder = ref(null)
const chunks = ref([])
const isRecording = ref(false)

const score = ref(null)
const scoreTip = ref('')
const scoreColor = ref('score-mid')

const goBack = () => {
  router.push({ name: 'PhonicDetail', params: { symbol: symbol.value } });
};

function updateScoreUI(v) {
  if (v >= 85) {
    scoreColor.value = 'score-good'
    scoreTip.value = '发音非常标准！'
  } else if (v >= 60) {
    scoreColor.value = 'score-mid'
    scoreTip.value = '大部分清晰，可再提高。'
  } else {
    scoreColor.value = 'score-bad'
    scoreTip.value = '建议注意重音和音节。'
  }
}

function playTTS(text) {
  TTSService.speakWithWebAPI(text, {})
}

function loadPractice(symbolParam) {
  const s = symbolParam || symbol.value
  const words = phonicsWords[s] || []
  currentIndex.value = 0

  if (words.length > 0) {
    currentItem.value = { type: 'word', text: words[currentIndex.value].text }
  } else {
    currentItem.value = null
    console.warn(`No words found for symbol: ${s}`)
  }
}

function nextPhonic() {
  currentItem.value = null
  setTimeout(() => {
    currentPhonicIndex.value = (currentPhonicIndex.value + 1) % phonicsSymbols.length
    symbol.value = phonicsSymbols[currentPhonicIndex.value]
    loadPractice()
  }, 400)
}

function prevPhonic() {
  currentItem.value = null
  setTimeout(() => {
    currentPhonicIndex.value = (currentPhonicIndex.value - 1 + phonicsSymbols.length) % phonicsSymbols.length
    symbol.value = phonicsSymbols[currentPhonicIndex.value]
    loadPractice()
  }, 400)
}

function nextPractice() {
  const words = phonicsWords[symbol.value] || []
  if (words.length === 0) return

  currentIndex.value = (currentIndex.value + 1) % words.length
  currentItem.value = { type: 'word', text: words[currentIndex.value].text }

  score.value = null
  scoreTip.value = ''
}

const nextBtn = ref(null)
function handleNextClick() {
  nextBtn.value.classList.add('click-animation')
  nextPractice()
  setTimeout(() => {
    nextBtn.value.classList.remove('click-animation')
  }, 300)
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    chunks.value = []

    mediaRecorder.value.ondataavailable = e => {
      if (e.data.size > 0) chunks.value.push(e.data)
    }

    mediaRecorder.value.onstop = async () => {
      const blob = new Blob(chunks.value, { type: 'audio/webm' })
      const s = await evaluatePronunciation(blob, currentItem.value.text)
      score.value = s
      updateScoreUI(s)
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (e) {
    alert('无法启动录音，请检查麦克风权限。')
    console.error(e)
  }
}

function stopRecording() {
  isRecording.value = false
  mediaRecorder.value.stop()
}

onMounted(() => {
  const path = localStorage.getItem('lastPhonicDetail')
  if (!path) {
    // 兜底逻辑，默认第一个音标
    symbol.value = phonicsSymbols[0]
    currentPhonicIndex.value = 0
    loadPractice(symbol.value)
    return
  }

  const seg = path.split('/')
  symbol.value = decodeURIComponent(seg[seg.length - 1])

  if (phonicsSymbols.includes(symbol.value)) {
    currentPhonicIndex.value = phonicsSymbols.indexOf(symbol.value)
  } else {
    currentPhonicIndex.value = 0
    symbol.value = phonicsSymbols[0]
  }

  loadPractice(symbol.value)
})
</script>

<style scoped>
.practice-page {
  padding: 20px;
  background: #E5FFE5FF;
  min-height: calc(100vh - 82px);
  text-align: center;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.practice-phonic {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  background: linear-gradient(145deg, #66d96c, #4cc052);
  box-shadow: 5px 5px 15px rgba(0,0,0,0.3),
  inset 2px 2px 5px rgba(255,255,255,0.5),
  inset -3px -3px 7px rgba(0,0,0,0.2);
  color: #fff;
  padding: 40px 20px;
  text-align: center;
  border-radius: 12px;
  margin-top: 0;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}
.practice-phonic h1{
  width: 50px;
}

.phonic-nav-btn {
  background: rgba(255, 255, 255, 0.47);
  box-shadow: 3px 3px 10px rgba(0,0,0,0.3),
  inset 1px 1px 5px rgba(255,255,255,0.8),
  inset -2px -2px 5px rgba(0,0,0,0.1);
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}



.practice-type {
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: rgba(0, 0, 0, 0.63);
  border-left: 4px solid #4CAF50;
  padding-left: 8px;
  background: #93c593;
  border-radius: 12px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
}

.practice-target {
  background: #fdf5e6;
  color: #000;
  padding: 40px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
  height: 160px;
  width: 100%;
  box-sizing: border-box;
}

.practice-target h2 {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  height: 80px;
}

.play-btn {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  margin: 10px 0;
  cursor: pointer;
}

.next-btn {
  position: fixed;
  right: -10px;
  bottom: 100px;
  padding: 12px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 50px 0 0 50px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 100;
  transition: all 0.3s ease;
}

.next-btn.click-animation {
  transform: translateX(-10px);
}

@media (min-width: 601px) {
  .next-btn {
    right: calc(50% - 311px);
  }
}

.record-area button {
  padding: 10px 16px;
  font-size: 1.2rem;
  background: #ff8a00;
  color: white;
  border: none;
  border-radius: 8px;
}

.score-panel {
  margin-top: 25px;
  text-align: center;
}

.score-number {
  font-size: 3rem;
  font-weight: bold;
}

.score-good { color: #4caf50; }
.score-mid { color: #ffc107; }
.score-bad { color: #f44336; }

.score-bar-wrapper {
  width: 100%;
  height: 14px;
  background: #eee;
  border-radius: 8px;
  margin: 12px 0;
}

.score-bar-fill {
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(to right, #f44336, #ffc107, #4caf50);
  transition: 0.4s ease;
}

.score-tip {
  font-size: 1.1rem;
  color: #444;
}
</style>
