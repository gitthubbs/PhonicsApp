<template>
  <div class="phonic-chart">
    <div class="phonic-chart-title">
      <h1 style="color: #1a1a1a">48个音标</h1>
    </div>

    <div v-for="(group, index) in phonicsGroups" :key="index" class="phonics-group">
      <h2 class="group-title">{{ group.title }}</h2>
      <div class="cards-container">
        <div
            v-for="phonetic in group.items"
            :key="phonetic.symbol"
            class="phonetic-card"
            @click="goToDetail(phonetic.symbol)"
        >
          {{ phonetic.symbol }}
        </div>
      </div>
      <div
          v-if="index < phonicsGroups.length - 1"
          class="group-divider"
      ></div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'PhonicChart',
  setup() {
    const router = useRouter();

    // 分组音标示例
    const phonicsGroups = [
      {
        title: '元音 (Vowels)',
        items: [
          { symbol: 'i:' }, { symbol: 'ɪ' }, { symbol: 'e' }, { symbol: 'æ' },
          { symbol: 'ɑ:' }, { symbol: 'ɒ' }, { symbol: 'ɔ:' }, { symbol: 'ʊ' },
          { symbol: 'u:' }, { symbol: 'ʌ' }, { symbol: 'ɜ:' }, { symbol: 'ə' }
        ]
      },
      {
        title: '双元音 (Diphthongs)',
        items: [
          { symbol: 'eɪ' }, { symbol: 'aɪ' }, { symbol: 'ɔɪ' }, { symbol: 'aʊ' },
          { symbol: 'əʊ' }, { symbol: 'ɪə' }, { symbol: 'eə' }, { symbol: 'ʊə' }
        ]
      },
      {
        title: '辅音 (Consonants)',
        items: [
          { symbol: 'p' }, { symbol: 'b' }, { symbol: 't' }, { symbol: 'd' },
          { symbol: 'k' }, { symbol: 'g' }, { symbol: 'f' }, { symbol: 'v' },
          { symbol: 'θ' }, { symbol: 'ð' }, { symbol: 's' }, { symbol: 'z' },
          { symbol: 'ʃ' }, { symbol: 'ʒ' }, { symbol: 'h' }, { symbol: 'm' },
          { symbol: 'n' }, { symbol: 'ŋ' }, { symbol: 'l' }, { symbol: 'r' },
          { symbol: 'j' }, { symbol: 'w' }
        ]
      }
    ];

    const goToDetail = (symbol) => {
      router.push({ name: 'PhonicDetail', params: { symbol } });
    };

    return { phonicsGroups, goToDetail };
  }
}
</script>

<style scoped>

.phonic-chart {
  background-color: #f0f4f8;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 10px;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.phonics-group {
  width: 100%;
  max-width: 540px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.phonetic-card {
  flex: 0 0 calc(25% - 9px); /* 四个卡片一行 */
  background-color: #4a90e2;
  color: #fff;
  border-radius: 8px;
  text-align: center;
  padding: 18px 0;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
}

.group-title {
  font-size: 20px;
  margin: 20px 0 10px;
  color: #333;
}

.group-divider {
  height: 2px;
  background-color: #6dd8ff;
  margin: 20px 0;
  border-radius: 1px;
}


</style>