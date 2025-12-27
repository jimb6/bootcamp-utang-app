<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Contracts</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Summary Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Summary</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <p class="label">Total Contracts</p>
              <h2>{{ myContracts.length }}</h2>
            </div>
            <div class="summary-item">
              <p class="label">Total Balance</p>
              <h2 class="amount">₱{{ totalBalance.toLocaleString() }}</h2>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Contracts List -->
      <h3 class="section-title">Active Contracts</h3>
      <ion-list v-if="myContracts.length > 0">
        <ion-item v-for="contract in myContracts" :key="contract.id" button @click="viewDetails(contract)">
          <ion-icon :icon="documentTextOutline" slot="start" :color="getStatusColor(contract.status)"></ion-icon>
          <ion-label>
            <h2>Contract #{{ contract.id.slice(-6) }}</h2>
            <p>Principal: ₱{{ contract.principalAmount.toLocaleString() }}</p>
            <p>Balance: ₱{{ contract.remainingBalance.toLocaleString() }} of ₱{{ contract.totalAmount.toLocaleString() }}</p>
            <ion-badge :color="getStatusColor(contract.status)">{{ contract.status.toUpperCase() }}</ion-badge>
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
        </ion-item>
      </ion-list>

      <ion-card v-else class="empty-state">
        <ion-icon :icon="documentTextOutline" size="large"></ion-icon>
        <ion-card-content>
          <p>No contracts found.</p>
        </ion-card-content>
      </ion-card>

      <!-- Contract Details Modal -->
      <ion-modal :is-open="showDetailsModal" @did-dismiss="showDetailsModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Contract Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showDetailsModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" v-if="selectedContract">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Contract #{{ selectedContract.id.slice(-6) }}</ion-card-title>
              <ion-badge :color="getStatusColor(selectedContract.status)">
                {{ selectedContract.status.toUpperCase() }}
              </ion-badge>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-label>Principal Amount:</ion-label>
                  <ion-note slot="end">₱{{ selectedContract.principalAmount.toLocaleString() }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Interest Rate:</ion-label>
                  <ion-note slot="end">{{ selectedContract.interestRate }}%</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Total Amount:</ion-label>
                  <ion-note slot="end">₱{{ selectedContract.totalAmount.toLocaleString() }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Paid:</ion-label>
                  <ion-note slot="end" color="success">₱{{ (selectedContract.totalAmount - selectedContract.remainingBalance).toLocaleString() }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Remaining Balance:</ion-label>
                  <ion-note slot="end" color="warning">₱{{ selectedContract.remainingBalance.toLocaleString() }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Term:</ion-label>
                  <ion-note slot="end">{{ selectedContract.termMonths }} months</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Start Date:</ion-label>
                  <ion-note slot="end">{{ formatDate(selectedContract.startDate) }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label>Due Date:</ion-label>
                  <ion-note slot="end">{{ formatDate(selectedContract.dueDate) }}</ion-note>
                </ion-item>
                <ion-item v-if="selectedContract.notes">
                  <ion-label class="ion-text-wrap">
                    <p><strong>Notes:</strong></p>
                    <p>{{ selectedContract.notes }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Payment History -->
          <h3>Payment History</h3>
          <ion-list v-if="contractPayments.length > 0">
            <ion-item v-for="payment in contractPayments" :key="payment.id">
              <ion-icon :icon="cashOutline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>₱{{ payment.amount.toLocaleString() }}</h3>
                <p>{{ formatDate(payment.paymentDate) }}</p>
                <p v-if="payment.receiptNumber">Receipt: {{ payment.receiptNumber }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          <ion-card v-else>
            <ion-card-content>
              <p class="ion-text-center">No payments recorded yet.</p>
            </ion-card-content>
          </ion-card>
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
} from '@ionic/vue';
import {
  documentTextOutline,
  cashOutline,
  chevronForwardOutline,
  logOutOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { UtangContract } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showDetailsModal = ref(false);
const selectedContract = ref<UtangContract | null>(null);

const borrowerId = computed(() => store.currentUser.value?.borrowerId || '');

const myContracts = computed(() => {
  return store.contracts.value.filter(c => c.borrowerId === borrowerId.value);
});

const totalBalance = computed(() => {
  return myContracts.value.reduce((sum, c) => sum + c.remainingBalance, 0);
});

const contractPayments = computed(() => {
  if (!selectedContract.value) return [];
  return store.getPaymentsByContract(selectedContract.value.id).value;
});

const viewDetails = (contract: UtangContract) => {
  selectedContract.value = contract;
  showDetailsModal.value = true;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'completed': return 'medium';
    case 'overdue': return 'danger';
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
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  text-align: center;
  padding: 8px;
}

.summary-item {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.05), rgba(var(--ion-color-secondary-rgb), 0.05));
}

.summary-item .label {
  color: var(--ion-color-medium);
  font-size: 13px;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--ion-color-dark);
}

.summary-item h2.amount {
  background: linear-gradient(135deg, var(--ion-color-warning), var(--ion-color-danger));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-title {
  margin: 32px 0 16px 0;
  color: var(--ion-color-primary);
  font-size: 20px;
  font-weight: 700;
  padding-left: 4px;
}

ion-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 16px 0;
  overflow: hidden;
}

ion-card-header {
  background: linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.08), rgba(var(--ion-color-secondary-rgb), 0.08));
}

ion-card-title {
  font-size: 20px;
  font-weight: 700;
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

ion-modal ion-item {
  --background: transparent;
  box-shadow: none;
  border-bottom: 1px solid var(--ion-color-light);
  border-radius: 0;
  margin-bottom: 0;
  --min-height: 56px;
}

ion-note {
  font-weight: 600;
  font-size: 15px;
}
</style>
