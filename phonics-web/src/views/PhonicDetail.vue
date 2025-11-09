<template>
  <div class="phonic-detail">
    <div class="phonic-detail-header">
      <button class="back-button" @click="goBack"><</button>
      </div>
    <!-- 音标卡片 -->
    <div class="symbol-card">
      <h1>{{ symbol }}</h1>
      <button class="pronunciation-symbol-button" @click="playSymbolPronunciation">🔊</button>
      <!-- 隐藏的音频播放器用于音标发音 -->
      <audio ref="audioPlayer0" style="display: none;"></audio>
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
          <span v-html="word.highlightedText || word.text"></span>
          <button class="pronunciation-button" @click="speakWord(word.text)">🔊</button>
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
            @click="speakSentence(sentence.originalText)"
        >
          <span v-html="sentence.highlightedText"></span>
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
    <button  class="practice-button" @click="handlePracticeClick" ref="practiceBtn">
      练习
    </button>
  </div>
</template>

<script>
import {ref, computed, onMounted, onUnmounted, onBeforeMount} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { phonicsSentences } from '../data/phonicsSentences';
import { phonicsWords } from '../data/phonicsWords';
import { highlightPhonics } from '../utils/highlightPhonics'
import { TTSService } from "../services/ttsService.js";
import {useTtsStore} from "@/store/ttsStore.js";


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
    const route = useRoute();
    const symbol = ref(props.symbol);
    const sentences = ref(phonicsSentences[symbol.value]);
    const words = ref(phonicsWords[symbol.value]);
    const practiceBtn = ref(null);

    const audioPlayer = ref(null)
    const audioPlayer0 = ref(null)

    const activeSentenceIndex = ref(-1);

    onBeforeMount(() => {
      // 记录当前访问的音标路由
      localStorage.setItem('lastPhonicDetail', route.fullPath)
    })

    const highlightedSentences = computed(() =>
        sentences.value.map(s => ({
            originalText: typeof s === 'string' ? s : s.text,
            highlightedText: highlightPhonics(s, symbol.value)
        }))
    )

    // 高亮例词，存储当前点击的 word
    const activeWordIndex = ref(-1)
    const highlightedWords = computed(() =>
        words.value.map((word, index) => {
          if (index === activeWordIndex.value) {
            return {...word, highlightedText: highlightPhonics(word.text, symbol.value)}
          }
          return word
        })
    )

    const clickWord = index => {
      activeWordIndex.value = index
    }

    const handleSentenceClick = async(text, event) => {
      // const card = event.currentTarget;
      // const index = highlightedSentences.value.findIndex(s => s.originalText === text);
      // activeSentenceIndex.value = index;
      //
      // card.classList.add('active');
      try {
        await speakSentence(text); // 等待语音播放完成
      } finally {

      }

    };


    // 预加载当前页面的所有TTS
    const preloadPageTTS = async () => {
      try {
        // 获取所有需要TTS的文本
        const allTexts = [
          ...words.value.map(w => w.text),
          ...sentences.value.map(s => typeof s === 'string' ? s : s.text)
        ];

        // 预加载TTS
        await TTSService.preloadPageTTS(allTexts, {
          rate: 0.8,
          pitch: 1.0,
          locale: 'en-GB'
        });

        console.log('页面TTS预加载完成');
      } catch (error) {
        console.warn('页面TTS预加载失败:', error);
      }
    };

    const playSymbolPronunciation = () => {
      // 音标发音文件路径格式为 /audio/phonic/[音标].mp3
      const audioPath = `/audio/phonic/${symbol.value}.mp3`;
      audioPlayer0.value.src = audioPath;
      audioPlayer0.value.play();
    };

    const playPronunciation = async (wordText) => {
      if (!audioPlayer0.value) {
        console.error('音频播放器未正确初始化');
        return;
      }

      // 音标发音文件路径格式为 /audio/words/[单词].mp3
      try {
        const audioPath = `/audio/words/${wordText}.mp3`;

        // 暂停并重置当前播放
        audioPlayer0.value.pause();
        audioPlayer0.value.currentTime = 0;

        // 强制设置新的音频源
        audioPlayer0.value.src = audioPath;
        audioPlayer0.value.load();

        // 播放音频
        audioPlayer0.value.play().catch(error => {
          console.error('播放音频失败:', error);
          // 提供更详细的错误信息
          if (error.name === 'NotSupportedError') {
            console.error(`音频文件 ${audioPath} 不存在或格式不支持`);
          }
        });
      } catch (error) {
        console.error('音频播放错误:', error);
      }
    }

    const speakWithTTS = async (text, options = {}) => {
      try {
        console.log('开始TTS播放:', text);
        await TTSService.speakWithWebAPI(text, options);
        console.log('TTS播放完成:', text);
      } catch (error) {
        console.error('TTS播放失败:', error);
        throw error; // 重新抛出错误以便上层捕获
      }
    };

    // ✅ 清除所有句子的播放动画 + RAF + active 状态
    function clearAllSentencePlayback() {
      window.speechSynthesis.cancel(); // 停止 TTS

      document.querySelectorAll(".sentence-card").forEach(card => {
        // 取消高亮
        card.classList.remove("active");

        // 移除进度条
        const bar = card.querySelector(".progress-bar");
        if (bar) bar.remove();

        // 取消 RAF 动画
        const rafId = sentenceRafMap.get(card);
        if (rafId) cancelAnimationFrame(rafId);

        // 清理 Map
        sentenceRafMap.delete(card);
      });
    }

    const sentenceRafMap = new Map();

    let isSpeaking = false;
    let currentSpeakingText = null;

    const speakWord = async (text) => {
      // 清理所有例句动画
      await speakWithTTS(text);
    }


    const speakSentence = async (text) => {
      // 绑定到被点击的卡片
      const index = highlightedSentences.value.findIndex(s => s.originalText === text);
      activeSentenceIndex.value = index;
      const card = document.querySelectorAll(".sentence-card")[index];

      // 清理所有例句动画
      clearAllSentencePlayback();

      if (!card) {
        return;
      }

      // 创建新的进度条
      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      progressBar.style.cssText = `
        position:absolute;
        left:0; top:0; height:100%;
        width:120%;
        transform-origin: left center;
        transform: scaleX(0);
        background: linear-gradient(to right, rgba(74,169,78,0.35), transparent);
        pointer-events:none;
        transition: transform 0.016s linear;
        will-change: transform;`;
      card.appendChild(progressBar);
      card.classList.add("active");

      // 动画参数
      let startTime = 0;
      const store = useTtsStore();
      const baseDuration = 1800;
      const duration = Math.min(baseDuration / (store.rate || 1), 5000);

      function animateFrame(now) {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / duration, 1);

        // scaleX 动画
        progressBar.style.transform = `scaleX(${p})`;

        if (p < 1) {
          const rafId = requestAnimationFrame(animateFrame);
          sentenceRafMap.set(card, rafId); // 存储到 Map
        } else {
          sentenceRafMap.delete(card);
        }
      }


      await TTSService.speakWithWebAPI(text, {
        rate: 0.8,
        pitch: 1.0,
        locale: 'en-GB',

        onStart() {
          console.log("播放开始:", text);
          startTime = performance.now();
          const rafId = requestAnimationFrame(animateFrame);
          sentenceRafMap.set(card, rafId);
        },

        onEnd() {
          console.log("播放结束:", text);

          // 强制进度到 100%
          progressBar.style.transform = "scaleX(1)";

          setTimeout(() => {
            progressBar.remove();
            card.classList.remove("active");
            sentenceRafMap.delete(card);
          }, 250);
        }
      }).catch(err => {
        // 失败也要清理
        console.warn('TTS失败或被中断，已清理进度条', err);
        progressBar.remove();
        card.classList.remove("active");
        const rafId = sentenceRafMap.get(card);
        if (rafId) cancelAnimationFrame(rafId);
        sentenceRafMap.delete(card);
      });

      isSpeaking = false;
      currentSpeakingText = null;
    };

    const handlePracticeClick = () => {
      practiceBtn.value.classList.add('click-animation');

      // 执行原来的nextPractice逻辑
      setTimeout(() => {
        goPractice();
      }, 250);

      // 300ms后移除动画类
      setTimeout(() => {
        practiceBtn.value.classList.remove('click-animation');
      }, 300);
    };


    // 录音功能实现
    const mediaRecorder = ref(null);
    const audioChunks = ref([]);
    const isRecording = ref(false);
    const recordingTime = ref(0);
    let recordingInterval = null;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
        }
      });

        audioChunks.value = [];

        mediaRecorder.value = new MediaRecorder(stream, {
          mimeType: 'audio/webm; codecs=opus'
        });

        mediaRecorder.value.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunks.value.push(event.data);
          }
        };

        mediaRecorder.value.onstop = () => {
          const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });

          const audioUrl = URL.createObjectURL(audioBlob);
          audioPlayer.value.src = audioUrl;

          // 清理旧的URL
          if (audioPlayer.value.src) {
            URL.revokeObjectURL(audioPlayer.value.src);
          }
        };

        mediaRecorder.value.start();
        isRecording.value = true;
        recordingTime.value = 0;

        // 开始计时
        recordingInterval = setInterval(() => {
          recordingTime.value++;
        }, 1000);

        console.log('开始录音');
      } catch (error) {
        console.error('无法访问麦克风:', error);
        alert('无法访问麦克风，请检查权限设置');
      }
    };

    const stopRecording = () => {
      if (mediaRecorder.value && isRecording.value) {
        mediaRecorder.value.stop();
        mediaRecorder.value.stream.getTracks().forEach(track => track.stop());
        isRecording.value = false;

        // 停止计时
        if (recordingInterval) {
          clearInterval(recordingInterval);
          recordingInterval = null;
        }
        console.log('停止录音，录音时长:', recordingTime.value, '秒');
      }
    };

    const goBack = () => {
      router.push('/phonic');
    };

    const goPractice = () => {
      router.push({ name: 'Practice', params: { symbol: symbol.value } });
    };

    // 在组件挂载时预加载TTS
    onMounted(() => {
      console.log('组件挂载，开始预加载TTS');
      TTSService.preloadTTS().then(() => {
        console.log('基础TTS预加载完成');
        preloadPageTTS();
      }).catch(error => {
        console.error('预加载失败:', error);
      });
    });

    // 在组件卸载时清理TTS缓存
    onUnmounted(() => {
      TTSService.clearPageTTS(); // 新增
    });


    return { symbol,
      highlightedSentences,
      highlightedWords,
      audioPlayer,
      audioPlayer0,
      activeSentenceIndex,
      practiceBtn,
      playSymbolPronunciation,
      playPronunciation,
      preloadPageTTS,
      speakWithTTS,
      speakWord,
      speakSentence,
      clickWord,
      startRecording,
      stopRecording,
      handlePracticeClick,
       goBack,
       goPractice }
  }
}
</script>

<style scoped>
.phonic-detail {
  position: relative;
  max-width: 600px;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 15px 20px;
  margin: 0 auto;
  font-family: 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #E5FFE5FF;
  min-height: calc(100vh - 82px);
}

.practice-button{
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

.practice-button.click-animation {
  transform: translateX(-10px);
}

@media (min-width: 601px) {
  .practice-button {
    right: calc(50% - 310px);
  }
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
  background: rgba(75, 173, 79, 0.51);
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
  width: 100%;
  box-sizing: border-box;
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
  color: rgba(0, 0, 0, 0.63);
  border-left: 4px solid #4CAF50;
  padding-left: 8px;
  background: #93c593;
  border-radius: 12px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
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
  background: #fdf5e6;
  padding: 12px 16px;
  border-radius: 10px;
  flex: 1 0 120px;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
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
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.sentence-card.active {
  background: #fff8e1;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  transition: all 0.3s;
}


.sentence-card.active::before {
  width: 100%;
}

.sentence-card.active::after {
  width: 100%;
  opacity: 0;
  transition: width 0.5s ease-out, opacity 0.5s ease-out;
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