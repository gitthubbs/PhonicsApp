<template>
  <div class="phonic-chart">
      <div class="phonic-chart-title">
        <h1 style="color: #1a1a1a">学习音标</h1>
      </div>

    <div v-for="(group, index) in phonicsGroups" :key="index" class="phonics-group">
      <h2 class="group-title">{{ group.title }}</h2>
      <div class="cards-container">
        <div
            v-for="phonetic in group.items"
            :key="phonetic.symbol"
            class="phonetic-card"
            @click="handleCardClick(phonetic.symbol)"
            :class="{ 'active': activeCard === phonetic.symbol }"
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
import {ref} from "vue";

export default {
  name: 'PhonicChart',
  setup() {
    const router = useRouter();

    // 分组音标
    const phonicsGroups = [
      {
        title: '元音 (Vowels)',
        items: [
          { symbol: 'iː' }, { symbol: 'ɪ' }, { symbol: 'e' }, { symbol: 'æ' },
          { symbol: 'ɑː' }, { symbol: 'ɒ' }, { symbol: 'ɔː' }, { symbol: 'ʊ' },
          { symbol: 'uː' }, { symbol: 'ʌ' }, { symbol: 'ɜː' }, { symbol: 'ə' }
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


    const activeCard = ref(null);
    const handleCardClick = (symbol) => {
      activeCard.value = symbol;

      setTimeout(() => {
        goToDetail(symbol);
        activeCard.value = null;
      }, 250);
    };


    return { phonicsGroups, goToDetail, handleCardClick, activeCard };

  }
}
</script>

<style scoped>

.phonic-chart {
  background-color: #E5FFE5FF;
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 82px);
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
  background-color: #56ce5c;
  color: #fff;
  border-radius: 20px;
  text-align: center;
  padding: 20px 0;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.phonetic-card.active {
  transform: scale(0.95);
  background-color: #3da543;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.group-title {
  font-size: 20px;
  margin: 10px 0 20px;
  color: #333;
}

.group-divider {
  height: 2px;
  background-color: #56ce5c;
  margin: 20px 0;
  border-radius: 1px;
}



</style>