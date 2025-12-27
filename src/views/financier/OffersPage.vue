<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Utang Offers</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="header-actions">
        <ion-button expand="block" @click="showAddModal = true">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
          Create Offer
        </ion-button>
      </div>

      <!-- Offers List -->
      <ion-list v-if="store.offers.value.length > 0">
        <ion-item v-for="offer in store.offers.value" :key="offer.id">
          <ion-icon :icon="giftOutline" slot="start" :color="getStatusColor(offer.status)"></ion-icon>
          <ion-label>
            <h2>{{ offer.borrowerName }}</h2>
            <p>Amount: ₱{{ offer.offeredAmount.toLocaleString() }}</p>
            <p>{{ offer.termMonths }} months @ {{ offer.interestRate }}%</p>
            <p>Valid until: {{ formatDate(offer.expiryDate) }}</p>
            <ion-badge :color="getStatusColor(offer.status)">{{ offer.status.toUpperCase() }}</ion-badge>
          </ion-label>
          <ion-button fill="clear" @click="viewDetails(offer)">
            <ion-icon :icon="eyeOutline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <ion-card v-else class="empty-state">
        <ion-icon :icon="giftOutline" size="large"></ion-icon>
        <ion-card-content>
          <p>No offers created yet.</p>
        </ion-card-content>
      </ion-card>

      <!-- Add Offer Modal -->
      <ion-modal :is-open="showAddModal" @did-dismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Create Offer</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-select 
              v-model="formData.borrowerId" 
              label="Borrower" 
              label-placement="floating"
              @ion-change="selectBorrower"
            >
              <ion-select-option 
                v-for="borrower in store.borrowers.value" 
                :key="borrower.id" 
                :value="borrower.id"
              >
                {{ borrower.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-input 
              v-model.number="formData.offeredAmount" 
              label="Offer Amount (₱)" 
              label-placement="floating"
              type="number"
              placeholder="10000"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input 
              v-model.number="formData.interestRate" 
              label="Interest Rate (%)" 
              label-placement="floating"
              type="number"
              placeholder="5"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input 
              v-model.number="formData.termMonths" 
              label="Term (Months)" 
              label-placement="floating"
              type="number"
              placeholder="12"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input 
              v-model="formData.expiryDate" 
              label="Expiry Date" 
              label-placement="floating"
              type="date"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-textarea 
              v-model="formData.notes" 
              label="Notes" 
              label-placement="floating"
              :rows="3"
              placeholder="Offer terms and conditions"
            ></ion-textarea>
          </ion-item>
          <ion-button expand="block" @click="saveOffer" class="ion-margin-top">
            Create Offer
          </ion-button>
        </ion-content>
      </ion-modal>

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
              <ion-card-title>{{ selectedOffer.borrowerName }}</ion-card-title>
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
                  <ion-label>Term:</ion-label>
                  <ion-note slot="end">{{ selectedOffer.termMonths }} months</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Offer Date:</ion-label>
                  <ion-note slot="end">{{ formatDate(selectedOffer.offerDate) }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Expiry Date:</ion-label>
                  <ion-note slot="end">{{ formatDate(selectedOffer.expiryDate) }}</ion-note>
                </ion-item>
                <ion-item v-if="selectedOffer.notes">
                  <ion-label class="ion-text-wrap">
                    <p><strong>Notes:</strong></p>
                    <p>{{ selectedOffer.notes }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <div v-if="selectedOffer.status === 'pending'">
            <ion-button expand="block" color="danger" @click="updateOfferStatus('rejected')">
              Reject Offer
            </ion-button>
          </div>
          
          <ion-button 
            expand="block" 
            color="danger" 
            @click="confirmDeleteOffer"
            class="ion-margin-top"
          >
            Delete Offer
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonNote,
  alertController,
} from '@ionic/vue';
import {
  addOutline,
  giftOutline,
  eyeOutline,
  logOutOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { UtangOffer } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showAddModal = ref(false);
const showDetailsModal = ref(false);
const selectedOffer = ref<UtangOffer | null>(null);

const formData = ref({
  borrowerId: '',
  borrowerName: '',
  offeredAmount: 0,
  interestRate: 0,
  termMonths: 0,
  expiryDate: '',
  notes: '',
});

const resetForm = () => {
  // Default expiry 30 days from now
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 30);
  
  formData.value = {
    borrowerId: '',
    borrowerName: '',
    offeredAmount: 0,
    interestRate: 0,
    termMonths: 0,
    expiryDate: defaultExpiry.toISOString().split('T')[0],
    notes: '',
  };
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const selectBorrower = () => {
  const borrower = store.borrowers.value.find(b => b.id === formData.value.borrowerId);
  if (borrower) {
    formData.value.borrowerName = borrower.name;
  }
};

const saveOffer = () => {
  if (!formData.value.borrowerId || !formData.value.offeredAmount) {
    alert('Please fill in required fields');
    return;
  }

  store.addOffer({
    borrowerId: formData.value.borrowerId,
    borrowerName: formData.value.borrowerName,
    offeredAmount: formData.value.offeredAmount,
    interestRate: formData.value.interestRate,
    termMonths: formData.value.termMonths,
    offerDate: new Date(),
    expiryDate: new Date(formData.value.expiryDate),
    status: 'pending',
    notes: formData.value.notes,
  });

  closeModal();
};

const viewDetails = (offer: UtangOffer) => {
  selectedOffer.value = offer;
  showDetailsModal.value = true;
};

const updateOfferStatus = (status: 'rejected') => {
  if (selectedOffer.value) {
    store.updateOffer(selectedOffer.value.id, { status });
    showDetailsModal.value = false;
  }
};

const confirmDeleteOffer = async () => {
  if (!selectedOffer.value) return;

  const alert = await alertController.create({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this offer?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          store.deleteOffer(selectedOffer.value!.id);
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

// Initialize form with default expiry date
resetForm();
</script>

<style scoped>
.header-actions {
  margin-bottom: 24px;
}

.header-actions ion-button {
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
  font-weight: 600;
  height: 48px;
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
}

ion-item:active {
  transform: scale(0.98);
}

ion-label h2 {
  font-weight: 600;
  font-size: 18px;
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
}

ion-card-header {
  padding-bottom: 8px;
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
