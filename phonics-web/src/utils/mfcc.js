// 从音频中提取 MFCC 特征
export async function extractMFCC(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate
    const raw = audioBuffer.getChannelData(0)
    const frameSize = 1024
    const hopSize = 512
    const mfccs = []

    for (let i = 0; i < raw.length - frameSize; i += hopSize) {
        const frame = raw.slice(i, i + frameSize)
        const mfcc = computeMFCC(frame, sampleRate)
        mfccs.push(mfcc)
    }

    return mfccs
}

// 简化版MFCC计算（取能量谱的对数）
function computeMFCC(frame, sampleRate) {
    const N = frame.length
    const re = new Float32Array(N)
    const im = new Float32Array(N)
    frame.forEach((v, i) => re[i] = v)

    // 计算FFT
    fft(re, im)

    const power = re.map((r, i) => r * r + im[i] * im[i])
    const melBands = 13
    const mfcc = new Array(melBands).fill(0)

    // 简化的mel滤波与对数压缩
    for (let m = 0; m < melBands; m++) {
        let start = Math.floor((m / melBands) * N / 2)
        let end = Math.floor(((m + 1) / melBands) * N / 2)
        const sum = power.slice(start, end).reduce((a, b) => a + b, 0)
        mfcc[m] = Math.log(sum + 1e-6)
    }

    return mfcc
}

// 简单FFT实现
function fft(re, im) {
    const N = re.length
    if (N <= 1) return

    const reEven = [], imEven = []
    const reOdd = [], imOdd = []
    for (let i = 0; i < N / 2; i++) {
        reEven.push(re[i * 2])
        imEven.push(im[i * 2])
        reOdd.push(re[i * 2 + 1])
        imOdd.push(im[i * 2 + 1])
    }

    fft(reEven, imEven)
    fft(reOdd, imOdd)

    for (let k = 0; k < N / 2; k++) {
        const t = -2 * Math.PI * k / N
        const cosT = Math.cos(t)
        const sinT = Math.sin(t)
        const tre = cosT * reOdd[k] - sinT * imOdd[k]
        const tim = sinT * reOdd[k] + cosT * imOdd[k]
        re[k] = reEven[k] + tre
        im[k] = imEven[k] + tim
        re[k + N / 2] = reEven[k] - tre
        im[k + N / 2] = imEven[k] - tim
    }
}
