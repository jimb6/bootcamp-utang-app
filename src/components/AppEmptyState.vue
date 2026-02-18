<template>
  <ion-card class="empty-state">
    <ion-icon :icon="icon" size="large" />
    <ion-card-content>
      <p>{{ message }}</p>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonIcon } from '@ionic/vue';

defineProps<{
  icon: string;
  message: string;
}>();
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 24px 16px;
  border-radius: 16px;
  margin: 12px;
}

.empty-state ion-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--ion-color-medium);
  font-size: 15px;
}
</style>
