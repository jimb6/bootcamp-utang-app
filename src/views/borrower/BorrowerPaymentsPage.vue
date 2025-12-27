<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Payment History</ion-title>
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
          <ion-card-title>Payment Summary</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <p class="label">Total Payments</p>
              <h2>{{ myPayments.length }}</h2>
            </div>
            <div class="summary-item">
              <p class="label">Total Paid</p>
              <h2 class="amount">₱{{ totalPaid.toLocaleString() }}</h2>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Payments List -->
      <h3 class="section-title">Recent Payments</h3>
      <ion-list v-if="myPayments.length > 0">
        <ion-item v-for="payment in sortedPayments" :key="payment.id">
          <ion-icon :icon="cashOutline" slot="start" color="success"></ion-icon>
          <ion-label>
            <h2>₱{{ payment.amount.toLocaleString() }}</h2>
            <p>{{ getContractInfo(payment.contractId) }}</p>
            <p>{{ formatDate(payment.paymentDate) }}</p>
            <p v-if="payment.receiptNumber" class="receipt-number">Receipt: {{ payment.receiptNumber }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-card v-else class="empty-state">
        <ion-icon :icon="cashOutline" size="large"></ion-icon>
        <ion-card-content>
          <p>No payments recorded yet.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
} from '@ionic/vue';
import { cashOutline, logOutOutline } from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';

const router = useRouter();
const store = useUtangStore();

const borrowerId = computed(() => store.currentUser.value?.borrowerId || '');

const myContracts = computed(() => {
  return store.contracts.value.filter(c => c.borrowerId === borrowerId.value);
});

const myPayments = computed(() => {
  const contractIds = myContracts.value.map(c => c.id);
  return store.payments.value.filter(p => contractIds.includes(p.contractId));
});

const sortedPayments = computed(() => {
  return [...myPayments.value].sort((a, b) => 
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );
});

const totalPaid = computed(() => {
  return myPayments.value.reduce((sum, p) => sum + p.amount, 0);
});

const getContractInfo = (contractId: string) => {
  const contract = store.contracts.value.find(c => c.id === contractId);
  return contract ? `Contract #${contract.id.slice(-6)}` : 'Unknown Contract';
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
  background: linear-gradient(135deg, rgba(var(--ion-color-success-rgb), 0.08), rgba(var(--ion-color-success-rgb), 0.03));
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
  color: var(--ion-color-success);
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
  background: linear-gradient(135deg, rgba(var(--ion-color-success-rgb), 0.08), rgba(var(--ion-color-success-rgb), 0.03));
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
  --min-height: 88px;
  transition: all 0.2s ease;
}

ion-label h2 {
  font-weight: 700;
  font-size: 22px;
  color: var(--ion-color-success);
  margin-bottom: 6px;
}

ion-label p {
  font-size: 14px;
  line-height: 1.5;
  margin: 2px 0;
}

.receipt-number {
  color: var(--ion-color-medium);
  font-size: 13px;
  font-weight: 500;
}
</style>
