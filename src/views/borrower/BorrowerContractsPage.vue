<template>
  <ion-page>
    <AppPageHeader title="My Contracts" :show-logout="true" @logout="logout" />
    <ion-content class="ion-padding">
      <AppStatsCard :stats="[
        { icon: documentTextOutline, iconColor: 'primary', value: myContracts.length, label: 'Total Contracts' },
        { icon: cashOutline, iconColor: 'warning', value: formatCurrency(totalBalance), label: 'Total Balance' },
      ]" />

      <AppSectionHeader :icon="documentTextOutline" title="Active Contracts" />

      <ion-list v-if="myContracts.length > 0">
        <ion-item v-for="contract in myContracts" :key="contract.id" button @click="viewDetails(contract)">
          <ion-icon :icon="documentTextOutline" slot="start" />
          <ion-label>
            <h2>Contract #{{ contract.id }}</h2>
            <p>Principal: {{ formatCurrency(contract.principalAmount) }}</p>
            <p>Balance: {{ formatCurrency(contract.remainingBalance) }} of {{ formatCurrency(contract.totalAmount) }}</p>
            <AppStatusBadge :status="contract.status" />
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" />
        </ion-item>
      </ion-list>

      <AppEmptyState v-else :icon="documentTextOutline" message="No contracts found." />

      <!-- Contract Details Modal -->
      <AppFormModal :is-open="showDetailsModal" title="Contract Details" @close="showDetailsModal = false">
        <template v-if="selectedContract">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Contract #{{ selectedContract.id }}</ion-card-title>
              <AppStatusBadge :status="selectedContract.status" />
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item><ion-label>Principal Amount:</ion-label><ion-note slot="end">{{ formatCurrency(selectedContract.principalAmount) }}</ion-note></ion-item>
                <ion-item><ion-label>Interest Rate:</ion-label><ion-note slot="end">{{ selectedContract.interestRate }}%</ion-note></ion-item>
                <ion-item><ion-label>Total Amount:</ion-label><ion-note slot="end">{{ formatCurrency(selectedContract.totalAmount) }}</ion-note></ion-item>
                <ion-item><ion-label>Paid:</ion-label><ion-note slot="end" color="success">{{ formatCurrency(selectedContract.totalAmount - selectedContract.remainingBalance) }}</ion-note></ion-item>
                <ion-item><ion-label>Remaining:</ion-label><ion-note slot="end" color="warning">{{ formatCurrency(selectedContract.remainingBalance) }}</ion-note></ion-item>
                <ion-item><ion-label>Term:</ion-label><ion-note slot="end">{{ selectedContract.termCount }} {{ selectedContract.termType }}</ion-note></ion-item>
                <ion-item><ion-label>Start Date:</ion-label><ion-note slot="end">{{ formatDate(selectedContract.startDate) }}</ion-note></ion-item>
                <ion-item><ion-label>Due Date:</ion-label><ion-note slot="end">{{ formatDate(selectedContract.dueDate) }}</ion-note></ion-item>
                <ion-item v-if="selectedContract.notes">
                  <ion-label class="ion-text-wrap"><p><strong>Notes:</strong></p><p>{{ selectedContract.notes }}</p></ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <AppSectionHeader :icon="cashOutline" title="Payment History" />
          <ion-list v-if="contractPayments.length > 0">
            <ion-item v-for="payment in contractPayments" :key="payment.id">
              <ion-icon :icon="cashOutline" slot="start" color="success" />
              <ion-label>
                <h3>{{ formatCurrency(payment.amount) }}</h3>
                <p>{{ formatDate(payment.paymentDate) }}</p>
                <p v-if="payment.receiptNumber">Receipt: {{ payment.receiptNumber }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          <AppEmptyState v-else :icon="cashOutline" message="No payments recorded yet." />
        </template>
      </AppFormModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonNote } from '@ionic/vue';
import { documentTextOutline, cashOutline, chevronForwardOutline } from 'ionicons/icons';
import AppPageHeader from '@/components/AppPageHeader.vue';
import AppStatsCard from '@/components/AppStatsCard.vue';
import AppSectionHeader from '@/components/AppSectionHeader.vue';
import AppEmptyState from '@/components/AppEmptyState.vue';
import AppFormModal from '@/components/AppFormModal.vue';
import AppStatusBadge from '@/components/AppStatusBadge.vue';
import { useUtangStore } from '@/composables/useUtangStore';
import { formatDate, formatCurrency } from '@/utils/formatters';
import type { Contract } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showDetailsModal = ref(false);
const selectedContract = ref<Contract | null>(null);

const borrowerId = computed(() => store.currentUser.value?.borrowerId || 0);

const myContracts = computed(() =>
  store.contracts.value.filter(c => c.borrowerId === borrowerId.value)
);

const totalBalance = computed(() =>
  myContracts.value.reduce((sum, c) => sum + c.remainingBalance, 0)
);

const contractPayments = computed(() => {
  if (!selectedContract.value) return [];
  return store.getPaymentsByContract(selectedContract.value.id).value;
});

const viewDetails = (contract: Contract) => {
  selectedContract.value = contract;
  showDetailsModal.value = true;
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

ion-label h2 { font-weight: 600; font-size: 18px; color: var(--ion-color-dark); margin-bottom: 6px; }
ion-label p  { font-size: 14px; line-height: 1.5; margin: 2px 0; }

ion-note { font-weight: 600; font-size: 15px; }
</style>
