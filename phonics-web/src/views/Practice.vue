<template>
  <div class="practice-page">

    <div class="phonic-detail-header">
      <button class="back-button" @click="goBack"><</button>
    </div>

    <h1>{{ symbol }}</h1>

    <div class="practice-content" v-if="currentItem">

      <!-- 练习类型：单词或句子 -->
      <div class="practice-type">
        {{ currentItem.type === 'word' ? '单词练习' : '句子练习' }}
      </div>

      <!-- 要练习的文本 -->
      <div class="practice-target">
          <h2>{{ currentItem.text }}</h2>
      </div>

      <!-- 播放按钮 -->
      <button class="play-btn" @click="playTTS(currentItem.text)">🔊 播放标准读音</button>

      <!-- 录音区 -->
      <div class="record-area">
        <button v-if="!isRecording" @click="startRecording">🎤 开始录音</button>
        <button v-if="isRecording" @click="stopRecording">⏹ 停止录音</button>
      </div>

      <!-- 评分区 -->
      <div v-if="score !== null" class="score-panel">
        <div class="score-number" :class="scoreColor">{{ score }}</div>

        <div class="score-bar-wrapper">
          <div class="score-bar-fill" :style="{ width: score + '%' }"></div>
        </div>

        <div class="score-tip">{{ scoreTip }}</div>
      </div>



    </div>
    <!-- 下一个 -->
    <button  class="next-btn" @click="handleNextClick" ref="nextBtn">
      下一个
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { phonicsWords } from '@/data/phonicsWords'
import { phonicsSentences } from '@/data/phonicsSentences'
import { TTSService } from '@/services/ttsService'
import router from "@/router/index.js";

// ✅ 引入你的评分计算
// import { evaluatePronunciation } from '@/utils/evaluatePronunciation'

const route = useRoute()
const symbol = ref('')

// 当前练习项
const currentItem = ref(null)

// 录音相关
const mediaRecorder = ref(null)
const chunks = ref([])
const isRecording = ref(false)

// 评分结果
const score = ref(null)
const scoreTip = ref('')
const scoreColor = ref('score-mid')

const goBack = () => {
  router.push({ name: 'PhonicDetail', params: { symbol: symbol.value } });
};

// ✅ 评分 UI 更新
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

// ✅ 播放标准读音
function playTTS(text) {
  TTSService.speakWithWebAPI(text, {})
}

// ✅ 初始化数据
function loadPractice() {
  // /phonic/iː → iː
  const path = localStorage.getItem('lastPhonicDetail')
  if (!path) return

  const seg = path.split('/')
  symbol.value = decodeURIComponent(seg[seg.length - 1])

  const items = []

  // 加载单词
  phonicsWords[symbol.value]?.forEach(w => {
    items.push({ type: 'word', text: w.text })
  })

  // 加载句子
  phonicsSentences[symbol.value]?.forEach(s => {
    items.push({ type: 'sentence', text: s.text })
  })

  // 随机选一条
  currentItem.value = items[Math.floor(Math.random() * items.length)]
}

// ✅ 下一题
function nextPractice() {
  score.value = null
  scoreTip.value = ''
  loadPractice()
}
const nextBtn = ref(null);

const handleNextClick = () => {

  nextBtn.value.classList.add('click-animation');

  // 执行原来的nextPractice逻辑
  nextPractice();

  // 300ms后移除动画类
  setTimeout(() => {
    nextBtn.value.classList.remove('click-animation');
  }, 300);
};

// ✅ 录音开始
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder.value = new MediaRecorder(stream)
  chunks.value = []

  mediaRecorder.value.ondataavailable = e => {
    if (e.data.size > 0) chunks.value.push(e.data)
  }

  mediaRecorder.value.onstop = async () => {
    const blob = new Blob(chunks.value, { type: 'audio/webm' })

    // ✅ 调用评分
    const s = await evaluatePronunciation(blob, currentItem.value.text)
    score.value = s
    updateScoreUI(s)
  }

  mediaRecorder.value.start()
  isRecording.value = true
}

// ✅ 录音停止
function stopRecording() {
  isRecording.value = false
  mediaRecorder.value.stop()
}

onMounted(() => {
  loadPractice()
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

.practice-page h1{
  background: #4CAF50;
  color: #fff;
  padding: 40px 20px;
  text-align: center;
  align-content: space-between;
  border-radius: 12px;
  margin-top: 0;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  position: relative;
  width: 100%;
  box-sizing: border-box;
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
  color: #000000;
  padding: 40px 20px;
  text-align: center;
  align-content: space-between;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
  position: relative;
  height: 160px;
  width: 100%;
  box-sizing: border-box;
}

.practice-target h2{
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  height: 80px;
}

.play-btn{
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
  margin: 10px 0;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 100;
  transition: all 0.3s ease;
}

.next-btn.click-animation {
  transform: translateX(-10px);
}

@media (min-width: 601px) {
  .next-btn {
    right: calc(50% - 310px);
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
  position: relative;
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
