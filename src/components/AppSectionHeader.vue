<template>
  <div class="section-header">
    <ion-icon :icon="icon" />
    <h3>{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';

defineProps<{
  icon: string;
  title: string;
}>();
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--ion-color-primary);
}

.section-header:first-child {
  margin-top: 0;
}

.section-header ion-icon {
  font-size: 18px;
  color: var(--ion-color-primary);
}

.section-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ion-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
