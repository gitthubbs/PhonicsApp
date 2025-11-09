import { useTtsStore } from '@/store/ttsStore.js'

export class TTSService {

    static currentUtterance = null;
    static isCancelling = false;
    static utteranceCache = new Map();

    static async preloadTTS(locale = 'en-GB') {
        try {
            if (!('speechSynthesis' in window)) {
                throw new Error('浏览器不支持语音合成API');
            }

            // 预加载语音列表，初始化语音合成引擎
            const voices = await this.getAvailableVoices();
            console.log('预加载TTS完成，可用语音:', voices);
            return voices;
        } catch (error) {
            console.warn('预加载TTS失败:', error);
            return [];
        }
    }

    static async preloadPageTTS(texts, options = {}) {
        try {
            // 预加载页面所有文本的TTS

            // 直接同步创建并缓存utterance
            texts.forEach(text => {
                this.utteranceCache.set(text, this.setUtterance(text, options));
            });

            console.log('页面TTS预加载完成');
            return true;
        } catch (error) {
            console.warn('页面TTS预加载失败:', error);
            return false;
        }
    }

    static clearPageTTS() {
        // 清除当前页面缓存的所有TTS
        this.utteranceCache.clear();
        console.log('已清除页面TTS缓存');
    }

    static async speak(text, options = {}) {
        // 首先尝试 Capacitor 插件（适用于 Android）
        if (window.capacitor && window.capacitor.Plugins && window.capacitor.Plugins.TextToSpeech) {
            try {
                return await this.speakWithCapacitor(text, options);
            } catch (error) {
                console.warn('Capacitor TTS 失败，尝试 Web Speech API');
                // 如果 Capacitor 失败，回退到 Web Speech API
                return await this.speakWithWebAPI(text, options);
            }
        }
        // 其次尝试 Web Speech API（适用于所有现代浏览器）
        else if ('speechSynthesis' in window) {
            return await this.speakWithWebAPI(text, options);
        }
        // 如果都不支持，抛出错误
        else {
            throw new Error('TTS 功能在当前环境中不可用');
        }
    }


    static setUtterance(text, options = {}) {
        const store = useTtsStore()

        const utterance = new SpeechSynthesisUtterance(text);

        const voices = speechSynthesis.getVoices()
        console.log(voices)

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
        try {
            return await window.capacitor.Plugins.TextToSpeech.speak({
                text: text,
                rate: options.rate || 0.7,
                pitch: options.pitch || 1.0,
                locale: options.locale || 'en-GB'
            });
        } catch (error) {
            console.error('Capacitor TTS 播放失败:', error);
            throw new Error('Android TTS 播放失败');
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