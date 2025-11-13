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
import { phonicsGroups } from '@/data/phonicsGroups.js'

export default {
  name: 'PhonicChart',
  setup() {
    const router = useRouter();
    
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
  background: linear-gradient(145deg, #66d96c, #4cc052);
  box-shadow: 5px 5px 15px rgba(0,0,0,0.3),
  inset 2px 2px 5px rgba(255,255,255,0.5),
  inset -3px -3px 7px rgba(0,0,0,0.2);
  color: #fff;
  border-radius: 20px;
  text-align: center;
  padding: 20px 0;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.phonetic-card.active {
  transform: scale(0.95);
  background: linear-gradient(145deg, #4dae52, #3da543);
  box-shadow: 2px 2px 10px rgba(0,0,0,0.3),
  inset 1px 1px 3px rgba(255,255,255,0.3),
  inset -2px -2px 5px rgba(0,0,0,0.3);
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