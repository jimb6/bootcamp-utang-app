<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="borrowers" href="/financier/borrowers">
          <ion-icon :icon="peopleOutline" />
          <ion-label>Borrowers</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="contracts" href="/financier/contracts">
          <ion-icon :icon="documentTextOutline" />
          <ion-label>Contracts</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="payments" href="/financier/payments">
          <ion-icon :icon="cashOutline" />
          <ion-label>Payments</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="offers" href="/financier/offers">
          <ion-icon :icon="giftOutline" />
          <ion-label>Offers</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/vue';
import { peopleOutline, documentTextOutline, cashOutline, giftOutline } from 'ionicons/icons';
</script>

<style scoped>
ion-tab-bar {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

ion-tab-button {
  --ripple-color: var(--ion-color-primary);
}
</style>
