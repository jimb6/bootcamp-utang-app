<template>
  <ion-page>
    <AppPageHeader title="Payment History" :show-logout="true" @logout="logout" />
    <ion-content class="ion-padding">
      <AppStatsCard :stats="[
        { icon: cashOutline, iconColor: 'success', value: myPayments.length, label: 'Total Payments' },
        { icon: cashOutline, iconColor: 'success', value: formatCurrency(totalPaid), label: 'Total Paid' },
      ]" />

      <AppSectionHeader :icon="cashOutline" title="Recent Payments" />

      <ion-list v-if="myPayments.length > 0">
        <ion-item v-for="payment in sortedPayments" :key="payment.id">
          <ion-icon :icon="cashOutline" slot="start" color="success" />
          <ion-label>
            <h2>{{ formatCurrency(payment.amount) }}</h2>
            <p>{{ getContractInfo(payment.contractId) }}</p>
            <p>{{ formatDate(payment.paymentDate) }}</p>
            <p v-if="payment.receiptNumber" class="receipt-number">Receipt: {{ payment.receiptNumber }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <AppEmptyState v-else :icon="cashOutline" message="No payments recorded yet." />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonIcon } from '@ionic/vue';
import { cashOutline } from 'ionicons/icons';
import AppPageHeader from '@/components/AppPageHeader.vue';
import AppStatsCard from '@/components/AppStatsCard.vue';
import AppSectionHeader from '@/components/AppSectionHeader.vue';
import AppEmptyState from '@/components/AppEmptyState.vue';
import { useUtangStore } from '@/composables/useUtangStore';
import { formatDate, formatCurrency } from '@/utils/formatters';

const router = useRouter();
const store = useUtangStore();

const borrowerId = computed(() => store.currentUser.value?.borrowerId || 0);

const myContracts = computed(() =>
  store.contracts.value.filter(c => c.borrowerId === borrowerId.value)
);

const myPayments = computed(() => {
  const contractIds = myContracts.value.map(c => c.id);
  return store.payments.value.filter(p => contractIds.includes(p.contractId));
});

const sortedPayments = computed(() =>
  [...myPayments.value].sort((a, b) =>
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )
);

const totalPaid = computed(() =>
  myPayments.value.reduce((sum, p) => sum + p.amount, 0)
);

const getContractInfo = (contractId: number) => {
  const contract = store.contracts.value.find(c => c.id === contractId);
  return contract ? `Contract #${contract.id}` : 'Unknown Contract';
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
  --min-height: 88px;
}

ion-label h2 { font-weight: 700; font-size: 22px; color: var(--ion-color-success); margin-bottom: 6px; }
ion-label p  { font-size: 14px; line-height: 1.5; margin: 2px 0; }

.receipt-number { color: var(--ion-color-medium); font-size: 13px; font-weight: 500; }
</style>
