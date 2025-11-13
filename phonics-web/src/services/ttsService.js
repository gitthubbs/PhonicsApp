import { useTtsStore } from '@/store/ttsStore.js'
import { Capacitor } from '@capacitor/core';

export class TTSService {

    static currentUtterance = null;
    static isCancelling = false;
    static utteranceCache = new Map();
    static voicesReady = false;

    static async preloadTTS(locale = 'en-GB') {
        try {
            if (!('speechSynthesis' in window)) {
                throw new Error('浏览器不支持语音合成API');
            }

            await this.ensureVoicesLoaded();

            // 预加载语音列表，初始化语音合成引擎
            const voices = await this.getAvailableVoices();
            console.log('预加载TTS完成，可用语音:', voices);
            return voices;
        } catch (error) {
            console.warn('预加载TTS失败:', error);
            return [];
        }
    }

    static ensureVoicesLoaded() {
        return new Promise(resolve => {
            const synth = window.speechSynthesis;

            const voices = synth.getVoices();
            if (voices && voices.length > 0) {
                this.voicesReady = true;
                resolve();
                return;
            }

            // 监听 voices 加载
            const handler = () => {
                this.voicesReady = true;
                synth.removeEventListener('voiceschanged', handler);
                resolve();
            };

            synth.addEventListener('voiceschanged', handler);
            // 兜底触发
            synth.getVoices();
        });
    }

    static async preloadPageTTS(texts, options = {}) {
        try {
            // 预加载页面所有文本的TTS

            // 直接同步创建并缓存utterance
            texts.forEach(text => {
                this.utteranceCache.set(text, this.setUtterance(text, options));
            });

            console.log('页面TTS服务预加载完成');
            return true;
        } catch (error) {
            console.warn('页面TTS服务预加载失败:', error);
            return false;
        }
    }

    static clearPageTTS() {
        // 清除当前页面缓存的所有TTS
        this.utteranceCache.clear();
        console.log('已清除页面TTS缓存');
    }

    static async speak(text, options = {}) {
        const platform = Capacitor.getPlatform();
        const isAndroid = platform === 'android';
        console.log('平台:', platform);
        if (isAndroid) {
            try {
                console.log('尝试使用 Capacitor TTS...');
                return await this.speakWithCapacitor(text, options);
            } catch (e) {
                console.warn('Capacitor TTS 失败，回退到 Web API:', e);
                return await this.speakWithWebAPI(text, options);
            }
        }
        else {
                console.log('Web API TTS :', text);
                return await this.speakWithWebAPI(text, options);
            }

    }


    static setUtterance(text, options = {}) {
        const store = useTtsStore()

        const utterance = new SpeechSynthesisUtterance(text);

        const voices = speechSynthesis.getVoices()

        const savedVoiceName = localStorage.getItem('tts-settings')
            ? JSON.parse(localStorage.getItem('tts-settings')).voiceName
            : null;
        const voice = voices.find(v => v.name === (savedVoiceName || store.voiceName))
            || voices[0];

        utterance.rate = store.rate;
        utterance.pitch = 1.0;
        utterance.voice = voice;

        return utterance;
    }

    static async speakWithWebAPI(text, options = {}) {
        console.log('开始处理TTS请求:', text);
        return new Promise((resolve, reject) => {
            try {
                if (!window.speechSynthesis) {
                    throw new Error('不支持语音合成');
                }


                const wasSpeaking = window.speechSynthesis.speaking;
                if (wasSpeaking) {
                    window.speechSynthesis.cancel();
                    this.isCancelling = true;
                }

                const utterance = this.utteranceCache.has(text)
                    ? this.utteranceCache.get(text)
                    : this.setUtterance(text, options);

                this.currentUtterance = utterance;

                utterance.onstart = () => {
                    console.log('语音开始播放:', text);
                    this.isCancelling = false;
                    options.onStart && options.onStart();

                };

                utterance.onboundary = (e) => {
                    // 某些浏览器/声音不触发 boundary，需要兜底
                    options.onBoundary && options.onBoundary({
                        charIndex: e.charIndex || 0,
                        charLength: e.charLength || 1
                    });
                };

                utterance.onend = () => {
                    if (this.isCancelling) {
                        console.log('语音被取消:', text);
                    } else {
                        console.log('语音播放完成:', text);
                    }
                    this.currentUtterance = null;
                    options.onEnd && options.onEnd();
                    resolve(utterance);
                };

                utterance.onerror = (e) => {
                    if (e.error === 'interrupted' || e.error === 'canceled') {
                        console.log('语音播放被中断:', text);
                        resolve(utterance);
                        return;
                    }
                    console.error('语音播放错误:', e);
                    this.currentUtterance = null;
                    reject(e);
                };

                setTimeout(() => {
                    try {
                        window.speechSynthesis.speak(utterance);
                    } catch (e) {
                        console.error('播放异常:', e);
                        reject(e);
                    }
                }, wasSpeaking ? 10 : 0);

            } catch (error) {
                console.error('TTS处理异常:', error);
                reject(error);
            }
        });
    }

    static async speakWithCapacitor(text, options = {}) {
        const store = useTtsStore();

        try {
            return await window.capacitor.Plugins.TextToSpeech.speak({
                text,
                rate: store.rate,         // ✅ 与 Pinia 设置同步
                pitch: 1.0,
                locale: store.locale,     // ✅ en-GB / en-US
                voice: store.voiceName    // ✅ 用户选的 voice
            });
        } catch (e) {
            console.error("Capacitor TTS 播放失败:", e);
            throw e;
        }
    }

    static async getAvailableVoices() {
        // 首先尝试 Capacitor 插件
        if (window.capacitor && window.capacitor.Plugins && window.capacitor.Plugins.TextToSpeech) {
            try {
                return await window.capacitor.Plugins.TextToSpeech.getSupportedVoices();
            } catch (error) {
                console.warn('获取 Capacitor 语音列表失败，尝试 Web Speech API');
                // 如果 Capacitor 失败，回退到 Web Speech API
                if ('speechSynthesis' in window) {
                    return window.speechSynthesis.getVoices();
                }
            }
        }
        // 其次使用 Web Speech API
        else if ('speechSynthesis' in window) {
            return window.speechSynthesis.getVoices();
        }
        return [];
    }
}