<template>
  <div class="phonic-detail">
    <!-- 音标大标题 -->
    <div class="symbol-card">
      <h1>{{ symbol }}</h1>
    </div>

    <!-- 例词区域 -->
    <div class="section">
      <h2>例词 (Words)</h2>
      <div class="words-list">
        <div
            class="word-card"
            v-for="(word, index) in words"
            :key="index"
        >
          <span>{{ word.text }}</span>
          <button @click="playPronunciation(word.audio)">🔊</button>
        </div>
      </div>
    </div>

    <!-- 例句区域 -->
    <div class="section">
      <h2>例句 (Sentences)</h2>
      <div class="sentences-list">
        <div class="sentence-card" v-for="(sentence, index) in sentences" :key="index">
          {{ sentence }}
        </div>
      </div>
    </div>

    <!-- 录音功能区域 -->
    <div class="section">
      <h2>练习发音 (Record)</h2>
      <div class="record-area">
        <button @click="startRecording">🎤 开始录音</button>
        <button @click="stopRecording">⏹ 停止录音</button>
        <audio ref="audioPlayer" controls></audio>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PhonicDetail',
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  setup() {
    // 示例数据，后续可替换为真实音频和例句
    const words = ref([
      { text: 'see', audio: '/audio/see.mp3' },
      { text: 'seat', audio: '/audio/seat.mp3' },
      { text: 'tree', audio: '/audio/tree.mp3' },
      { text: 'bee', audio: '/audio/bee.mp3' },
    ])

    const sentences = ref([
      'I see a tree.',
      'The bee is on the flower.',
      'She likes to sit on the seat.',
    ])

    const audioPlayer = ref(null)

    const playPronunciation = (src) => {
      audioPlayer.value.src = src
      audioPlayer.value.play()
    }

    // 录音功能占位，后续可用 MediaRecorder 接口实现
    const startRecording = () => {
      alert('开始录音功能暂未实现')
    }
    const stopRecording = () => {
      alert('停止录音功能暂未实现')
    }

    return { words, sentences, audioPlayer, playPronunciation, startRecording, stopRecording }
  }
}
</script>

<style scoped>
.phonic-detail {
  max-width: 800px;
  margin: 20px auto;
  padding: 10px;
  font-family: 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

.symbol-card {
  background: #4CAF50;
  color: #fff;
  padding: 40px 20px;
  text-align: center;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.symbol-card h1 {
  font-size: 4rem;
  margin: 0;
}

.section {
  margin-bottom: 30px;
}

.section h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #4CAF50;
  border-left: 4px solid #4CAF50;
  padding-left: 8px;
}

.words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.word-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 10px;
  flex: 1 0 120px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.word-card:hover {
  transform: translateY(-3px);
  cursor: pointer;
}

.sentences-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sentence-card {
  background: #fdf5e6;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.record-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-area button {
  background: #FF5722;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.record-area button:hover {
  background: #e64a19;
}
</style>
