<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>{{ title }}</ion-title>
      <ion-buttons slot="end">
        <slot name="actions" />
        <ion-button v-if="showLogout" @click="$emit('logout')">
          <ion-icon :icon="logOutOutline" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';

defineProps<{
  title: string;
  showLogout?: boolean;
}>();

defineEmits<{
  logout: [];
}>();
</script>
