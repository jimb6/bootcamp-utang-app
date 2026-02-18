<template>
  <ion-page>
    <AppPageHeader title="Utang Offers" :show-logout="true" @logout="logout" />
    <ion-content>
      <AppActionButton label="Create Offer" :icon="addOutline" @click="showAddModal = true" />

      <!-- Offers List -->
      <ion-list v-if="store.offers.value.length > 0">
        <ion-item v-for="offer in store.offers.value" :key="offer.id">
          <ion-icon :icon="giftOutline" slot="start" :color="getStatusIconColor(offer.status)" />
          <ion-label>
            <h2>{{ offer.borrowerFullName }}</h2>
            <p>Amount: {{ formatCurrency(offer.offeredAmount) }}</p>
            <p>{{ offer.termMonths }} months @ {{ offer.interestRate }}%</p>
            <p>Valid until: {{ formatDate(offer.expiryDate) }}</p>
            <AppStatusBadge :status="offer.status" />
          </ion-label>
          <ion-button fill="clear" @click="viewDetails(offer)">
            <ion-icon :icon="eyeOutline" />
          </ion-button>
        </ion-item>
      </ion-list>

      <AppEmptyState v-else :icon="giftOutline" message="No offers created yet." />

      <!-- Add Offer Modal -->
      <AppFormModal :is-open="showAddModal" title="Create Offer" @close="closeAddModal">
        <ion-item class="form-item">
          <ion-select v-model="form.borrowerId" label="Borrower" label-placement="floating">
            <ion-select-option v-for="b in store.borrowers.value" :key="b.id" :value="b.id">
              {{ b.fullName }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model.number="form.offeredAmount" label="Offer Amount (₱)" label-placement="floating" type="number" placeholder="10000" />
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model.number="form.interestRate" label="Interest Rate (%)" label-placement="floating" type="number" placeholder="5" />
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model.number="form.termMonths" label="Term (Months)" label-placement="floating" type="number" placeholder="12" />
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model="form.expiryDate" label="Expiry Date" label-placement="floating" type="date" />
        </ion-item>
        <ion-item class="form-item">
          <ion-textarea v-model="form.notes" label="Notes" label-placement="floating" :rows="3" placeholder="Offer terms and conditions" />
        </ion-item>
        <ion-button expand="block" @click="saveOffer" class="save-button">Create Offer</ion-button>
      </AppFormModal>

      <!-- Offer Details Modal -->
      <AppFormModal :is-open="showDetailsModal" title="Offer Details" @close="showDetailsModal = false">
        <template v-if="selectedOffer">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ selectedOffer.borrowerFullName }}</ion-card-title>
              <AppStatusBadge :status="selectedOffer.status" />
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item><ion-label>Offered Amount:</ion-label><ion-note slot="end">{{ formatCurrency(selectedOffer.offeredAmount) }}</ion-note></ion-item>
                <ion-item><ion-label>Interest Rate:</ion-label><ion-note slot="end">{{ selectedOffer.interestRate }}%</ion-note></ion-item>
                <ion-item><ion-label>Term:</ion-label><ion-note slot="end">{{ selectedOffer.termMonths }} months</ion-note></ion-item>
                <ion-item><ion-label>Offer Date:</ion-label><ion-note slot="end">{{ formatDate(selectedOffer.offerDate) }}</ion-note></ion-item>
                <ion-item><ion-label>Expiry Date:</ion-label><ion-note slot="end">{{ formatDate(selectedOffer.expiryDate) }}</ion-note></ion-item>
                <ion-item v-if="selectedOffer.notes">
                  <ion-label class="ion-text-wrap"><p><strong>Notes:</strong></p><p>{{ selectedOffer.notes }}</p></ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <div v-if="selectedOffer.status === OfferStatus.Pending">
            <ion-button expand="block" color="danger" @click="rejectSelectedOffer">Reject Offer</ion-button>
          </div>
          <ion-button expand="block" color="danger" @click="handleDeleteOffer" class="ion-margin-top">Delete Offer</ion-button>
        </template>
      </AppFormModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonTextarea, IonSelect, IonSelectOption, IonNote } from '@ionic/vue';
import { addOutline, giftOutline, eyeOutline } from 'ionicons/icons';
import AppPageHeader from '@/components/AppPageHeader.vue';
import AppActionButton from '@/components/AppActionButton.vue';
import AppEmptyState from '@/components/AppEmptyState.vue';
import AppFormModal from '@/components/AppFormModal.vue';
import AppStatusBadge from '@/components/AppStatusBadge.vue';
import { useUtangStore } from '@/composables/useUtangStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { formatDate, formatCurrency, futureDateISO } from '@/utils/formatters';
import type { Offer, CreateOfferRequest } from '@/types';
import { OfferStatus } from '@/types';

const router = useRouter();
const store = useUtangStore();
const { confirm } = useConfirmDialog();

const showAddModal = ref(false);
const showDetailsModal = ref(false);
const selectedOffer = ref<Offer | null>(null);

const emptyForm = (): Omit<CreateOfferRequest, 'borrowerId'> & { borrowerId: number } => ({
  borrowerId: 0,
  offeredAmount: 0,
  interestRate: 0,
  termMonths: 0,
  expiryDate: futureDateISO(30),
  notes: '',
});

const form = ref(emptyForm());

const closeAddModal = () => {
  showAddModal.value = false;
  form.value = emptyForm();
};

const saveOffer = async () => {
  if (!form.value.borrowerId || !form.value.offeredAmount) {
    alert('Please fill in required fields');
    return;
  }

  const payload: CreateOfferRequest = {
    borrowerId: form.value.borrowerId,
    offeredAmount: form.value.offeredAmount,
    interestRate: form.value.interestRate,
    termMonths: form.value.termMonths,
    expiryDate: form.value.expiryDate,
    notes: form.value.notes || undefined,
  };

  try {
    await store.addOffer(payload);
    closeAddModal();
  } catch (err) {
    alert((err as Error).message);
  }
};

const viewDetails = (offer: Offer) => {
  selectedOffer.value = offer;
  showDetailsModal.value = true;
};

const rejectSelectedOffer = async () => {
  if (!selectedOffer.value) return;
  try {
    await store.updateOffer(selectedOffer.value.id, { status: OfferStatus.Rejected });
    showDetailsModal.value = false;
  } catch (err) {
    alert((err as Error).message);
  }
};

const handleDeleteOffer = async () => {
  if (!selectedOffer.value) return;
  const yes = await confirm({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this offer?',
    confirmText: 'Delete',
    destructive: true,
  });
  if (yes) {
    try {
      await store.deleteOffer(selectedOffer.value.id);
      showDetailsModal.value = false;
    } catch (err) {
      alert((err as Error).message);
    }
  }
};

const getStatusIconColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'accepted': return 'success';
    case 'rejected': return 'danger';
    default: return 'medium';
  }
};

const logout = () => {
  store.clearCurrentUser();
  router.push('/');
};
</script>

<style scoped>
ion-list { background: transparent; padding: 0 12px; }

ion-item {
  --padding-start: 16px; --padding-end: 16px;
  --background: white; --border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --min-height: 96px;
}

ion-label h2 { font-weight: 600; font-size: 18px; color: var(--ion-color-dark); margin-bottom: 6px; }
ion-label p  { font-size: 14px; line-height: 1.5; margin: 2px 0; }

.form-item {
  --background: white; --border-radius: 8px;
  --padding-start: 12px; --padding-end: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); font-size: 14px;
}

.save-button { margin-top: 12px; height: 48px; font-weight: 600; --border-radius: 12px; }

ion-note { font-weight: 600; font-size: 15px; }
</style>
