<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Loan Offers</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Pending Offers -->
      <h3 class="section-title">Pending Offers</h3>
      <ion-list v-if="pendingOffers.length > 0">
        <ion-item v-for="offer in pendingOffers" :key="offer.id" button @click="viewDetails(offer)">
          <ion-icon :icon="giftOutline" slot="start" color="warning"></ion-icon>
          <ion-label>
            <h2>₱{{ offer.offeredAmount.toLocaleString() }}</h2>
            <p>{{ offer.termMonths }} months @ {{ offer.interestRate }}%</p>
            <p>Expires: {{ formatDate(offer.expiryDate) }}</p>
            <ion-badge color="warning">PENDING</ion-badge>
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
        </ion-item>
      </ion-list>

      <ion-card v-else class="empty-state">
        <ion-icon :icon="giftOutline" size="large"></ion-icon>
        <ion-card-content>
          <p>No pending offers at this time.</p>
        </ion-card-content>
      </ion-card>

      <!-- Other Offers -->
      <h3 class="section-title" v-if="otherOffers.length > 0">Previous Offers</h3>
      <ion-list v-if="otherOffers.length > 0">
        <ion-item v-for="offer in otherOffers" :key="offer.id" button @click="viewDetails(offer)">
          <ion-icon :icon="documentOutline" slot="start" :color="getStatusColor(offer.status)"></ion-icon>
          <ion-label>
            <h2>₱{{ offer.offeredAmount.toLocaleString() }}</h2>
            <p>{{ offer.termMonths }} months @ {{ offer.interestRate }}%</p>
            <ion-badge :color="getStatusColor(offer.status)">{{ offer.status.toUpperCase() }}</ion-badge>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Offer Details Modal -->
      <ion-modal :is-open="showDetailsModal" @did-dismiss="showDetailsModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Offer Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showDetailsModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" v-if="selectedOffer">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Loan Offer</ion-card-title>
              <ion-badge :color="getStatusColor(selectedOffer.status)">
                {{ selectedOffer.status.toUpperCase() }}
              </ion-badge>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-label>Offered Amount:</ion-label>
                  <ion-note slot="end">₱{{ selectedOffer.offeredAmount.toLocaleString() }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Interest Rate:</ion-label>
                  <ion-note slot="end">{{ selectedOffer.interestRate }}%</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Total Repayment:</ion-label>
                  <ion-note slot="end">₱{{ calculateTotal(selectedOffer).toLocaleString() }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Term:</ion-label>
                  <ion-note slot="end">{{ selectedOffer.termMonths }} months</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Offer Date:</ion-label>
                  <ion-note slot="end">{{ formatDate(selectedOffer.offerDate) }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Valid Until:</ion-label>
                  <ion-note slot="end">{{ formatDate(selectedOffer.expiryDate) }}</ion-note>
                </ion-item>
                <ion-item v-if="selectedOffer.notes">
                  <ion-label class="ion-text-wrap">
                    <p><strong>Terms:</strong></p>
                    <p>{{ selectedOffer.notes }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <div v-if="selectedOffer.status === 'pending'">
            <ion-button expand="block" color="success" @click="acceptOffer">
              <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
              Accept Offer
            </ion-button>
            <ion-button expand="block" color="danger" @click="rejectOffer">
              <ion-icon :icon="closeOutline" slot="start"></ion-icon>
              Decline Offer
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonModal,
  IonBadge,
  IonNote,
  alertController,
} from '@ionic/vue';
import {
  giftOutline,
  documentOutline,
  chevronForwardOutline,
  checkmarkOutline,
  closeOutline,
  logOutOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { UtangOffer } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showDetailsModal = ref(false);
const selectedOffer = ref<UtangOffer | null>(null);

const borrowerId = computed(() => store.currentUser.value?.borrowerId || '');

const myOffers = computed(() => {
  return store.offers.value.filter(o => o.borrowerId === borrowerId.value);
});

const pendingOffers = computed(() => {
  return myOffers.value.filter(o => o.status === 'pending');
});

const otherOffers = computed(() => {
  return myOffers.value.filter(o => o.status !== 'pending');
});

const viewDetails = (offer: UtangOffer) => {
  selectedOffer.value = offer;
  showDetailsModal.value = true;
};

const calculateTotal = (offer: UtangOffer) => {
  return offer.offeredAmount + (offer.offeredAmount * offer.interestRate / 100);
};

const acceptOffer = async () => {
  if (!selectedOffer.value) return;

  const alert = await alertController.create({
    header: 'Accept Offer',
    message: `Do you want to accept this loan offer of ₱${selectedOffer.value.offeredAmount.toLocaleString()}?`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Accept',
        handler: () => {
          store.updateOffer(selectedOffer.value!.id, { status: 'accepted' });
          showDetailsModal.value = false;
        },
      },
    ],
  });

  await alert.present();
};

const rejectOffer = async () => {
  if (!selectedOffer.value) return;

  const alert = await alertController.create({
    header: 'Decline Offer',
    message: 'Are you sure you want to decline this offer?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Decline',
        role: 'destructive',
        handler: () => {
          store.updateOffer(selectedOffer.value!.id, { status: 'rejected' });
          showDetailsModal.value = false;
        },
      },
    ],
  });

  await alert.present();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'accepted': return 'success';
    case 'rejected': return 'danger';
    case 'expired': return 'medium';
    default: return 'primary';
  }
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const logout = () => {
  store.clearCurrentUser();
  router.push('/');
};
</script>

<style scoped>
.section-title {
  margin: 32px 0 16px 0;
  color: var(--ion-color-primary);
  font-size: 20px;
  font-weight: 700;
  padding-left: 4px;
}

.section-title:first-of-type {
  margin-top: 8px;
}

ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --background: white;
  --border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --min-height: 96px;
  transition: all 0.2s ease;
  cursor: pointer;
  border-left: 4px solid var(--ion-color-warning);
}

ion-item:active {
  transform: scale(0.98);
}

ion-label h2 {
  font-weight: 700;
  font-size: 22px;
  color: var(--ion-color-dark);
  margin-bottom: 6px;
}

ion-label p {
  font-size: 14px;
  line-height: 1.5;
  margin: 2px 0;
}

ion-badge {
  margin-left: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.5px;
}

ion-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 16px 0;
  overflow: hidden;
}

ion-card-header {
  background: linear-gradient(135deg, rgba(var(--ion-color-warning-rgb), 0.08), rgba(var(--ion-color-warning-rgb), 0.03));
}

ion-card-title {
  font-size: 20px;
  font-weight: 700;
}

ion-modal ion-item {
  --background: transparent;
  box-shadow: none;
  border-bottom: 1px solid var(--ion-color-light);
  border-radius: 0;
  margin-bottom: 0;
  --min-height: 56px;
  border-left: none;
}

ion-modal ion-button {
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
  margin-top: 8px;
}

ion-note {
  font-weight: 600;
  font-size: 15px;
}
</style>
