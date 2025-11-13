// 使用 WebAudio + MFCC 特征计算语音相似度评分

import { extractMFCC } from './mfcc.js'

// 计算两个向量间的余弦相似度
function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0
    let dot = 0, normA = 0, normB = 0
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8)
}

// 将相似度映射到分数（0~100）
function similarityToScore(sim) {
    return Math.min(100, Math.max(0, Math.round(sim * 100)))
}

/**
 * 录音打分核心函数
 * @param {Blob} userBlob - 用户录音
 * @param {string} targetText - 标准单词
 * @returns {Promise<number>} 评分 0-100
 */
export async function evaluatePronunciation(userBlob, targetText) {
    // 获取 AudioContext
    const audioCtx = new AudioContext()

    // 1️⃣ 解析用户录音为音频缓冲
    const userArrayBuffer = await userBlob.arrayBuffer()
    const userAudioBuffer = await audioCtx.decodeAudioData(userArrayBuffer)

    // 2️⃣ 生成标准TTS音频 (使用 SpeechSynthesis 录制)
    const ttsBlob = await synthesizeSpeech(targetText)
    const ttsArrayBuffer = await ttsBlob.arrayBuffer()
    const ttsAudioBuffer = await audioCtx.decodeAudioData(ttsArrayBuffer)

    // 3️⃣ 提取MFCC特征
    const userMFCC = await extractMFCC(userAudioBuffer)
    const ttsMFCC = await extractMFCC(ttsAudioBuffer)

    // 4️⃣ 对齐长度（简单平均）
    const minFrames = Math.min(userMFCC.length, ttsMFCC.length)
    const simFrames = []
    for (let i = 0; i < minFrames; i++) {
        simFrames.push(cosineSimilarity(userMFCC[i], ttsMFCC[i]))
    }

    // 5️⃣ 计算平均相似度并转化为分数
    const avgSim = simFrames.reduce((a, b) => a + b, 0) / simFrames.length
    return similarityToScore(avgSim)
}

// 使用 Web Speech API 生成标准音频并捕获成 Blob
async function synthesizeSpeech(text) {
    return new Promise((resolve) => {
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = 'en-GB'
        utter.rate = 1
        utter.pitch = 1

        const audioCtx = new AudioContext()
        const dest = audioCtx.createMediaStreamDestination()
        const mediaRecorder = new MediaRecorder(dest.stream)
        const chunks = []

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data)
        }
        mediaRecorder.onstop = () => {
            resolve(new Blob(chunks, { type: 'audio/webm' }))
        }

        const source = audioCtx.createMediaStreamSource(dest.stream)
        source.connect(audioCtx.destination)

        mediaRecorder.start()
        speechSynthesis.speak(utter)
        utter.onend = () => mediaRecorder.stop()
    })
}
