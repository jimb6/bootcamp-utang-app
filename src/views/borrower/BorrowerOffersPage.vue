<template>
  <ion-page>
    <AppPageHeader title="Loan Offers" :show-logout="true" @logout="logout" />
    <ion-content class="ion-padding">
      <!-- Pending Offers -->
      <AppSectionHeader :icon="giftOutline" title="Pending Offers" />

      <ion-list v-if="pendingOffers.length > 0">
        <ion-item v-for="offer in pendingOffers" :key="offer.id" button @click="viewDetails(offer)">
          <ion-icon :icon="giftOutline" slot="start" color="warning" />
          <ion-label>
            <h2>{{ formatCurrency(offer.offeredAmount) }}</h2>
            <p>{{ offer.termMonths }} months @ {{ offer.interestRate }}%</p>
            <p>Expires: {{ formatDate(offer.expiryDate) }}</p>
            <AppStatusBadge :status="offer.status" />
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" />
        </ion-item>
      </ion-list>

      <AppEmptyState v-else :icon="giftOutline" message="No pending offers at this time." />

      <!-- Previous Offers -->
      <template v-if="otherOffers.length > 0">
        <AppSectionHeader :icon="documentOutline" title="Previous Offers" />
        <ion-list>
          <ion-item v-for="offer in otherOffers" :key="offer.id" button @click="viewDetails(offer)">
            <ion-icon :icon="documentOutline" slot="start" />
            <ion-label>
              <h2>{{ formatCurrency(offer.offeredAmount) }}</h2>
              <p>{{ offer.termMonths }} months @ {{ offer.interestRate }}%</p>
              <AppStatusBadge :status="offer.status" />
            </ion-label>
          </ion-item>
        </ion-list>
      </template>

      <!-- Offer Details Modal -->
      <AppFormModal :is-open="showDetailsModal" title="Offer Details" @close="showDetailsModal = false">
        <template v-if="selectedOffer">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Loan Offer</ion-card-title>
              <AppStatusBadge :status="selectedOffer.status" />
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item><ion-label>Offered Amount:</ion-label><ion-note slot="end">{{ formatCurrency(selectedOffer.offeredAmount) }}</ion-note></ion-item>
                <ion-item><ion-label>Interest Rate:</ion-label><ion-note slot="end">{{ selectedOffer.interestRate }}%</ion-note></ion-item>
                <ion-item><ion-label>Total Repayment:</ion-label><ion-note slot="end">{{ formatCurrency(calculateTotal(selectedOffer)) }}</ion-note></ion-item>
                <ion-item><ion-label>Term:</ion-label><ion-note slot="end">{{ selectedOffer.termMonths }} months</ion-note></ion-item>
                <ion-item><ion-label>Offer Date:</ion-label><ion-note slot="end">{{ formatDate(selectedOffer.offerDate) }}</ion-note></ion-item>
                <ion-item><ion-label>Valid Until:</ion-label><ion-note slot="end">{{ formatDate(selectedOffer.expiryDate) }}</ion-note></ion-item>
                <ion-item v-if="selectedOffer.notes">
                  <ion-label class="ion-text-wrap"><p><strong>Terms:</strong></p><p>{{ selectedOffer.notes }}</p></ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <div v-if="selectedOffer.status === OfferStatus.Pending" class="action-buttons">
            <ion-button expand="block" color="success" @click="acceptOffer">
              <ion-icon :icon="checkmarkOutline" slot="start" />
              Accept Offer
            </ion-button>
            <ion-button expand="block" color="danger" @click="rejectOffer">
              <ion-icon :icon="closeOutline" slot="start" />
              Decline Offer
            </ion-button>
          </div>
        </template>
      </AppFormModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote } from '@ionic/vue';
import { giftOutline, documentOutline, chevronForwardOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import AppPageHeader from '@/components/AppPageHeader.vue';
import AppSectionHeader from '@/components/AppSectionHeader.vue';
import AppEmptyState from '@/components/AppEmptyState.vue';
import AppFormModal from '@/components/AppFormModal.vue';
import AppStatusBadge from '@/components/AppStatusBadge.vue';
import { useUtangStore } from '@/composables/useUtangStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { formatDate, formatCurrency } from '@/utils/formatters';
import type { Offer } from '@/types';
import { OfferStatus } from '@/types';

const router = useRouter();
const store = useUtangStore();
const { confirm } = useConfirmDialog();

const showDetailsModal = ref(false);
const selectedOffer = ref<Offer | null>(null);

const borrowerId = computed(() => store.currentUser.value?.borrowerId || 0);

const myOffers = computed(() =>
  store.offers.value.filter(o => o.borrowerId === borrowerId.value)
);

const pendingOffers = computed(() =>
  myOffers.value.filter(o => o.status === OfferStatus.Pending)
);

const otherOffers = computed(() =>
  myOffers.value.filter(o => o.status !== OfferStatus.Pending)
);

const viewDetails = (offer: Offer) => {
  selectedOffer.value = offer;
  showDetailsModal.value = true;
};

const calculateTotal = (offer: Offer) =>
  offer.offeredAmount + (offer.offeredAmount * offer.interestRate / 100);

const acceptOffer = async () => {
  if (!selectedOffer.value) return;
  const yes = await confirm({
    header: 'Accept Offer',
    message: `Do you want to accept this loan offer of ${formatCurrency(selectedOffer.value.offeredAmount)}?`,
    confirmText: 'Accept',
  });
  if (yes) {
    try {
      await store.updateOffer(selectedOffer.value.id, { status: OfferStatus.Accepted });
      showDetailsModal.value = false;
    } catch (err) {
      alert((err as Error).message);
    }
  }
};

const rejectOffer = async () => {
  if (!selectedOffer.value) return;
  const yes = await confirm({
    header: 'Decline Offer',
    message: 'Are you sure you want to decline this offer?',
    confirmText: 'Decline',
    destructive: true,
  });
  if (yes) {
    try {
      await store.updateOffer(selectedOffer.value.id, { status: OfferStatus.Rejected });
      showDetailsModal.value = false;
    } catch (err) {
      alert((err as Error).message);
    }
  }
};

const logout = () => {
  store.clearCurrentUser();
  router.push('/');
};
</script>

<style scoped>
ion-list { background: transparent; padding: 0; }

ion-item {
  --padding-start: 16px; --padding-end: 16px;
  --background: white; --border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --min-height: 96px;
}

ion-label h2 { font-weight: 700; font-size: 22px; color: var(--ion-color-dark); margin-bottom: 6px; }
ion-label p  { font-size: 14px; line-height: 1.5; margin: 2px 0; }

ion-note { font-weight: 600; font-size: 15px; }

.action-buttons ion-button { --border-radius: 12px; height: 48px; font-weight: 600; margin-top: 8px; }
</style>
