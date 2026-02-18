<template>
  <ion-page>
    <AppPageHeader title="Payments" :show-logout="true" @logout="logout" />
    <ion-content>
      <AppActionButton label="Record Payment" :icon="addOutline" @click="showAddModal = true" />

      <!-- Payments List -->
      <ion-list v-if="store.payments.value.length > 0">
        <ion-item v-for="payment in sortedPayments" :key="payment.id">
          <ion-icon :icon="cashOutline" slot="start" color="success" />
          <ion-label>
            <h2>{{ formatCurrency(payment.amount) }}</h2>
            <p>{{ getContractInfo(payment.contractId) }}</p>
            <p>{{ formatDate(payment.paymentDate) }}</p>
            <p v-if="payment.receiptNumber">Receipt: {{ payment.receiptNumber }}</p>
          </ion-label>
          <ion-button fill="clear" color="danger" @click="handleDelete(payment.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>

      <AppEmptyState v-else :icon="cashOutline" message="No payments recorded yet." />

      <!-- Add Payment Modal -->
      <AppFormModal :is-open="showAddModal" title="Record Payment" @close="closeModal">
        <ion-item class="form-item">
          <ion-select v-model="form.contractId" label="Contract" label-placement="floating" @ion-change="onContractChange">
            <ion-select-option v-for="c in activeContracts" :key="c.id" :value="c.id">
              {{ c.borrowerFullName }} - {{ formatCurrency(c.remainingBalance) }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-card v-if="selectedContract" class="info-card">
          <ion-card-content>
            <p><strong>Borrower:</strong> {{ selectedContract.borrowerFullName }}</p>
            <p><strong>Remaining Balance:</strong> {{ formatCurrency(selectedContract.remainingBalance) }}</p>
          </ion-card-content>
        </ion-card>

        <ion-item class="form-item">
          <ion-input v-model.number="form.amount" label="Amount (₱)" label-placement="floating" type="number" placeholder="1000" />
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model="form.paymentDate" label="Payment Date" label-placement="floating" type="date" />
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model="form.receiptNumber" label="Receipt Number" label-placement="floating" placeholder="OR-12345" />
        </ion-item>
        <ion-item class="form-item">
          <ion-textarea v-model="form.notes" label="Notes" label-placement="floating" :rows="2" placeholder="Payment details" />
        </ion-item>

        <ion-button expand="block" @click="savePayment" class="save-button">Record Payment</ion-button>
      </AppFormModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardContent, IonInput, IonTextarea, IonSelect, IonSelectOption } from '@ionic/vue';
import { addOutline, cashOutline, trashOutline } from 'ionicons/icons';
import AppPageHeader from '@/components/AppPageHeader.vue';
import AppActionButton from '@/components/AppActionButton.vue';
import AppEmptyState from '@/components/AppEmptyState.vue';
import AppFormModal from '@/components/AppFormModal.vue';
import { useUtangStore } from '@/composables/useUtangStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { formatDate, formatCurrency, todayISO } from '@/utils/formatters';
import type { Contract, CreatePaymentRequest } from '@/types';
import { ContractStatus } from '@/types';

const router = useRouter();
const store = useUtangStore();
const { confirm } = useConfirmDialog();

const showAddModal = ref(false);
const selectedContract = ref<Contract | null>(null);

const emptyForm = (): { contractId: number; amount: number; paymentDate: string; receiptNumber: string; notes: string } => ({
  contractId: 0,
  amount: 0,
  paymentDate: todayISO(),
  receiptNumber: '',
  notes: '',
});

const form = ref(emptyForm());

const activeContracts = computed(() =>
  store.contracts.value.filter((c) => c.status === ContractStatus.Active && c.remainingBalance > 0),
);

const sortedPayments = computed(() =>
  [...store.payments.value].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
);

const onContractChange = () => {
  selectedContract.value = store.contracts.value.find((c) => c.id === form.value.contractId) || null;
};

const getContractInfo = (contractId: number) => {
  const c = store.contracts.value.find((x) => x.id === contractId);
  return c ? `${c.borrowerFullName} - Contract` : 'Unknown Contract';
};

const closeModal = () => {
  showAddModal.value = false;
  form.value = emptyForm();
  selectedContract.value = null;
};

const savePayment = async () => {
  if (!form.value.contractId || !form.value.amount) {
    alert('Please fill in required fields');
    return;
  }
  if (selectedContract.value && form.value.amount > selectedContract.value.remainingBalance) {
    alert(`Payment amount cannot exceed remaining balance of ${formatCurrency(selectedContract.value.remainingBalance)}`);
    return;
  }

  const payload: CreatePaymentRequest = {
    contractId: form.value.contractId,
    amount: form.value.amount,
    paymentDate: form.value.paymentDate,
    receiptNumber: form.value.receiptNumber || undefined,
    notes: form.value.notes || undefined,
  };

  try {
    await store.addPayment(payload);
    closeModal();
  } catch (err) {
    alert((err as Error).message);
  }
};

const handleDelete = async (id: number) => {
  const yes = await confirm({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this payment? The contract balance will be adjusted.',
    confirmText: 'Delete',
    destructive: true,
  });
  if (yes) {
    try {
      await store.deletePayment(id);
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
ion-list { background: transparent; padding: 0 12px; }

ion-item {
  --padding-start: 16px; --padding-end: 16px;
  --background: white; --border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --min-height: 88px;
}

ion-label h2 { font-weight: 700; font-size: 22px; color: var(--ion-color-success); margin-bottom: 6px; }
ion-label p { font-size: 14px; line-height: 1.5; margin: 2px 0; }

.form-item {
  --background: white; --border-radius: 8px;
  --padding-start: 12px; --padding-end: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); font-size: 14px;
}

.info-card { border-left: 4px solid var(--ion-color-success); margin: 8px 0; border-radius: 12px; }

.save-button { margin-top: 12px; height: 48px; font-weight: 600; --border-radius: 12px; }
</style>
