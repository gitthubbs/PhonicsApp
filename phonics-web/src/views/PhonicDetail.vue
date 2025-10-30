<template>
  <div class="phonic-detail">
    <div class="phonic-detail-header">
      <button class="back-button" @click="goBack">←</button>
      </div>
    <!-- 音标卡片 -->
    <div class="symbol-card">
      <h1>{{ symbol }}</h1>
      <button class="pronunciation-symbol-button" @click="playSymbolPronunciation">🔊</button>
    </div>

    <!-- 例词区域 -->
    <div class="section">
      <h2>例词 (Words)</h2>
      <div class="words-list">
        <div
            class="word-card"
            v-for="(word, index) in highlightedWords"
            :key="index"
            @click="clickWord(index)"
        >
          <span v-html="word.text"></span>
          <button class="pronunciation-button" @click="playPronunciation(word.audio)">🔊</button>
        </div>
      </div>
    </div>

    <!-- 例句区域 -->
    <div class="section">
      <h2>例句 (Sentences)</h2>
      <div class="sentences-list">
        <div
            class="sentence-card"
            v-for="(sentence, index) in highlightedSentences"
            :key="index"
            v-html="sentence"
        ></div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { phonicsSentences } from '../data/phonicsSentences';
import { phonicsWords } from '../data/phonicsWords';
import { highlightPhonics } from '../utils/highlightPhonics'


export default {
  name: 'PhonicDetail',
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  setup(props) {

    const router = useRouter();
    const symbol = ref(props.symbol);
    const sentences = ref(phonicsSentences[symbol.value]);
    const words = ref(phonicsWords[symbol.value]);

    const audioPlayer = ref(null)

    const highlightedSentences = computed(() =>
        sentences.value.map(s => highlightPhonics(s, symbol.value))
    )

    // 高亮例词，存储当前点击的 word
    const activeWordIndex = ref(-1)
    const highlightedWords = computed(() =>
        words.value.map((word, index) => {
          if (index === activeWordIndex.value) {
            return { ...word, text: highlightPhonics(word.text, symbol.value) }
          }
          return word
        })
    )

    const clickWord = index => {
      activeWordIndex.value = index
    }

    const playSymbolPronunciation = () => {
      // 假设音标发音文件路径格式为 /audio/[音标].mp3
      const audioPath = `/audio/phonic/${symbol.value}.mp3`;
      audioPlayer.value.src = audioPath;
      audioPlayer.value.play();
    };

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
    const goBack = () => {
      router.go(-1);
    };

    return { symbol,
      highlightedSentences,
      highlightedWords,
      audioPlayer,
      playSymbolPronunciation,
      playPronunciation,
      clickWord,
      startRecording,
      stopRecording,
      goBack }
  }
}
</script>

<style scoped>
.phonic-detail {
  max-width: 540px;
  padding: 15px;
  font-family: 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #757575;
}

.phonic-detail-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 2px 1px;
  width: 99%;
  margin: 10px auto;
  background: rgb(75, 174, 80);
  border-radius: 16px;
}

.back-button {
  background: rgba(255,255,255,0.68);
  border: none;
  height: 90%;
  width: 15%;
  font-size: 25px;
  cursor: pointer;
  padding: 4px;
  margin: 5px;
  color: #4a90e2;
  border-radius: 17px;
}
.pronunciation-symbol-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 16px;
  font-size: 20px;
  cursor: pointer;
  color: white;
  transition: transform 0.2s;
}


.pronunciation-button {
  border: none;
  border-radius: 16px;
  font-size: 20px;
  cursor: pointer;
  color: white;
  background: rgba(76, 175, 80, 0.51);
  transition: transform 0.2s;
}


.symbol-card {
  background: #4CAF50;
  color: #fff;
  padding: 40px 20px;
  text-align: center;
  align-content: space-between;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  position: relative;
}

.symbol-card h1 {
  font-size: 4rem;
  margin: 0 0 20px 0;
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
  background: rgba(35, 35, 35, 0.62);
  border-radius: 12px;
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

span[style] {
  transition: all 0.3s;
}
</style>
