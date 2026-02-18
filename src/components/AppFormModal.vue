<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')" :class="modalClass">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="modal-content">
        <slot />
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';

defineProps<{
  isOpen: boolean;
  title: string;
  modalClass?: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.modal-content {
  padding: 8px;
}
</style>
