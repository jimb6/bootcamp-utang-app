<template>
  <ion-card class="stats-card">
    <ion-card-content>
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <ion-icon :icon="stat.icon" :color="stat.iconColor || 'light'" />
          <div>
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonIcon } from '@ionic/vue';

export interface StatItem {
  icon: string;
  iconColor?: string;
  value: string | number;
  label: string;
}

defineProps<{
  stats: StatItem[];
}>();
</script>

<style scoped>
.stats-card {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  color: white;
  margin: 8px 12px 12px 12px;
}

.stats-card ion-card-content {
  padding: 10px;
}

.stats-grid {
  display: grid;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-item ion-icon {
  font-size: 32px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-item h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: white;
}

.stat-item p {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}
</style>
