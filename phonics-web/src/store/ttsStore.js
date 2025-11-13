import { defineStore } from 'pinia'

export const useTtsStore = defineStore('tts', {
    state: () => ({
        rate: 0.8,
        pitch: 1.0,
        locale: 'en-GB',
        voiceName: null,
        ttsEnabled: true
    }),

    actions: {
        setRate(v) {
            this.rate = Number(v)
            this.save()
        },
        setVoice(v) {
            this.voiceName = v
            this.save()
        },
        setTtsEnabled(enabled) {
            this.ttsEnabled = enabled;
            this.save();
        },

        save() {
            localStorage.setItem('tts-settings', JSON.stringify(this.$state))
        },

        loadFromStorage() {
            const saved = localStorage.getItem('tts-settings')
            if (saved) {
                Object.assign(this, JSON.parse(saved));
            }
        }
    }
})
