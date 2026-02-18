<template>
  <div class="action-bar">
    <ion-button expand="block" @click="$emit('click')">
      <ion-icon :icon="icon" slot="start" />
      {{ label }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';

defineProps<{
  label: string;
  icon: string;
}>();

defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.action-bar {
  margin: 0 12px 16px 12px;
}

.action-bar ion-button {
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
  font-weight: 600;
  height: 48px;
}
</style>
