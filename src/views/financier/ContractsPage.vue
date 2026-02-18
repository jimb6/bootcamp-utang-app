<template>
  <ion-page>
    <AppPageHeader title="Mga Utang" :show-logout="true" @logout="logout" />
    <ion-content>
      <!-- Stats -->
      <AppStatsCard :stats="statsItems" />
      <AppActionButton label="Bag-ong Utang" :icon="addOutline" @click="showAddModal = true" />

      <!-- Search -->
      <div class="search-container">
        <ion-searchbar v-model="searchQuery" placeholder="Search by borrower name..." :debounce="300" show-clear-button="focus" />
      </div>

      <!-- Contracts List -->
      <ion-list v-if="filteredContracts.length > 0" lines="none">
        <ion-item v-for="contract in filteredContracts" :key="contract.id" @click="viewDetails(contract)" button>
          <div class="contract-item-content">
            <div class="contract-header">
              <div class="borrower-info">
                <ion-icon :icon="personCircleOutline" color="primary" />
                <h2>{{ contract.borrowerFullName }}</h2>
              </div>
              <AppStatusBadge :status="contract.status" />
            </div>
            <div class="contract-details">
              <div class="detail-row">
                <span class="label">Principal:</span>
                <span class="value primary">{{ formatCurrency(contract.principalAmount) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Interest:</span>
                <span class="value">{{ contract.interestRate.toFixed(2) }}%</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value primary">{{ formatCurrency(contract.totalAmount) }}</span>
              </div>
              <div class="detail-row highlight">
                <span class="label">Balance:</span>
                <span class="value balance">{{ formatCurrency(contract.remainingBalance) }}</span>
              </div>
            </div>
            <div class="contract-footer">
              <div class="term-info">
                <ion-icon :icon="calendarOutline" />
                <span>{{ formatDate(contract.startDate) }} - {{ formatDate(contract.dueDate) }}</span>
              </div>
            </div>
          </div>
        </ion-item>
      </ion-list>

      <AppEmptyState
        v-else
        :icon="documentTextOutline"
        :message="searchQuery ? 'No contracts found matching your search.' : 'No contracts yet. Create your first contract.'"
      />

      <!-- Add Contract Modal -->
      <AppFormModal :is-open="showAddModal" title="Bag-ong Utang" @close="closeAddModal">
        <AppSectionHeader :icon="personOutline" title="Borrower Information" />
        <ion-item class="form-item">
          <ion-select v-model="form.borrowerId" label="Pala-Utang (Borrower)" label-placement="floating" interface="action-sheet">
            <ion-select-option v-for="b in store.borrowers.value" :key="b.id" :value="b.id">
              {{ b.fullName }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <AppSectionHeader :icon="calendarOutline" title="Contract Terms" />
        <ion-item class="form-item">
          <ion-select v-model="form.termType" label="Term Type" label-placement="floating" interface="action-sheet">
            <ion-select-option value="daily">Daily</ion-select-option>
            <ion-select-option value="weekly">Weekly</ion-select-option>
            <ion-select-option value="monthly">Monthly</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model.number="form.termCount" label="No. of Days/Weeks/Months" label-placement="floating" type="number" placeholder="12" />
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model="form.startDate" label="Start Date" label-placement="floating" type="date" />
        </ion-item>

        <AppSectionHeader :icon="cashOutline" title="Financial Details" />
        <ion-item class="form-item">
          <ion-input v-model.number="form.principalAmount" label="Principal Amount (₱)" label-placement="floating" type="number" placeholder="10000" />
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model.number="form.interestRate" label="Interest Rate (%)" label-placement="floating" type="number" placeholder="5" />
        </ion-item>
        <ion-item class="form-item">
          <ion-select v-model="form.interestMode" label="Interest Mode" label-placement="floating" interface="action-sheet">
            <ion-select-option value="simple">Simple Interest</ion-select-option>
            <ion-select-option value="compound">Compound Interest</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="form-item">
          <ion-input v-model.number="form.liquidationRate" label="Liquidation Rate (%)" label-placement="floating" type="number" placeholder="2" />
        </ion-item>

        <AppSectionHeader :icon="calculatorOutline" title="Payment Summary" />
        <ion-item class="form-item readonly">
          <ion-input :value="formatCurrency(computedAmountPerTerm)" label="Amount per Day/Week/Month" label-placement="floating" readonly />
        </ion-item>
        <ion-item class="form-item readonly">
          <ion-input :value="formatCurrency(computedTotal)" label="Total Amount Payable" label-placement="floating" readonly />
        </ion-item>

        <AppSectionHeader :icon="documentTextOutline" title="Additional Information" />
        <ion-item class="form-item">
          <ion-textarea v-model="form.notes" label="Notes (Optional)" label-placement="floating" :rows="2" placeholder="Contract terms and conditions" />
        </ion-item>

        <ion-button expand="block" color="primary" @click="saveContract" class="save-button">
          <ion-icon :icon="checkmarkOutline" slot="start" />
          I-save ang Utang
        </ion-button>
      </AppFormModal>

      <!-- Contract Details Modal -->
      <AppFormModal :is-open="showDetailsModal" title="Contract Details" @close="showDetailsModal = false">
        <template v-if="selectedContract">
          <div class="status-card">
            <div class="borrower-header">
              <ion-icon :icon="personCircleOutline" size="large" />
              <div>
                <h2>{{ selectedContract.borrowerFullName }}</h2>
                <AppStatusBadge :status="selectedContract.status" />
              </div>
            </div>
          </div>

          <AppSectionHeader :icon="cashOutline" title="Financial Summary" />
          <div class="detail-card">
            <div class="detail-item">
              <span class="detail-label">Principal Amount</span>
              <span class="detail-value">{{ formatCurrency(selectedContract.principalAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Interest Rate</span>
              <span class="detail-value">{{ selectedContract.interestRate.toFixed(2) }}%</span>
            </div>
            <div class="detail-item highlight">
              <span class="detail-label">Total Amount</span>
              <span class="detail-value primary">{{ formatCurrency(selectedContract.totalAmount) }}</span>
            </div>
            <div class="detail-item highlight">
              <span class="detail-label">Remaining Balance</span>
              <span class="detail-value balance">{{ formatCurrency(selectedContract.remainingBalance) }}</span>
            </div>
          </div>

          <AppSectionHeader :icon="calendarOutline" title="Term Information" />
          <div class="detail-card">
            <div class="detail-item">
              <span class="detail-label">Term</span>
              <span class="detail-value">{{ selectedContract.termCount }} {{ selectedContract.termType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Start Date</span>
              <span class="detail-value">{{ formatDate(selectedContract.startDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Due Date</span>
              <span class="detail-value">{{ formatDate(selectedContract.dueDate) }}</span>
            </div>
          </div>

          <template v-if="selectedContract.notes">
            <AppSectionHeader :icon="documentTextOutline" title="Notes" />
            <div class="notes-card"><p>{{ selectedContract.notes }}</p></div>
          </template>

          <ion-button expand="block" color="danger" @click="handleDeleteContract" class="delete-button">
            <ion-icon :icon="trashOutline" slot="start" />
            Delete Contract
          </ion-button>
        </template>
      </AppFormModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonButton, IonIcon, IonInput, IonTextarea, IonSelect, IonSelectOption, IonSearchbar, onIonViewWillEnter } from '@ionic/vue';
import { addOutline, documentTextOutline, trendingUpOutline, walletOutline, checkmarkOutline, personOutline, calendarOutline, cashOutline, calculatorOutline, personCircleOutline, trashOutline } from 'ionicons/icons';
import AppPageHeader from '@/components/AppPageHeader.vue';
import AppStatsCard from '@/components/AppStatsCard.vue';
import type { StatItem } from '@/components/AppStatsCard.vue';
import AppActionButton from '@/components/AppActionButton.vue';
import AppEmptyState from '@/components/AppEmptyState.vue';
import AppFormModal from '@/components/AppFormModal.vue';
import AppSectionHeader from '@/components/AppSectionHeader.vue';
import AppStatusBadge from '@/components/AppStatusBadge.vue';
import { useUtangStore } from '@/composables/useUtangStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { formatDate, formatCurrency, todayISO } from '@/utils/formatters';
import { calculateTotalAmount, calculateAmountPerTerm } from '@/utils/calculations';
import type { Contract, CreateContractRequest } from '@/types';
import { InterestMode, TermType } from '@/types';

const router = useRouter();
const store = useUtangStore();
const { confirm } = useConfirmDialog();

const showAddModal = ref(false);
const showDetailsModal = ref(false);
const selectedContract = ref<Contract | null>(null);
const searchQuery = ref('');

onIonViewWillEnter(() => {
  store.fetchContracts();
});

// Stats
const statsItems = computed<StatItem[]>(() => [
  { icon: documentTextOutline, value: store.contracts.value.length, label: 'Total sa mga Utang' },
  { icon: trendingUpOutline, iconColor: 'success', value: formatCurrency(store.totalLentAmount.value), label: 'Total Giutang' },
  { icon: walletOutline, iconColor: 'warning', value: formatCurrency(store.totalOutstanding.value), label: 'Wala pa ma bayari na Utang' },
]);

// Filter & sort
const filteredContracts = computed(() => {
  let list = [...store.contracts.value];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((c) => c.borrowerFullName.toLowerCase().includes(q));
  }
  list.sort((a, b) => a.borrowerFullName.localeCompare(b.borrowerFullName));
  return list;
});

// Form
const emptyForm = () => ({
  borrowerId: 0,
  principalAmount: 0,
  interestRate: 0,
  interestMode: InterestMode.Simple,
  termType: TermType.Monthly as string,
  termCount: 1,
  liquidationRate: 0,
  startDate: todayISO(),
  notes: '',
});

const form = ref(emptyForm());

const computedTotal = computed(() =>
  calculateTotalAmount(form.value.principalAmount || 0, form.value.interestRate || 0, form.value.interestMode as InterestMode),
);
const computedAmountPerTerm = computed(() =>
  calculateAmountPerTerm(computedTotal.value, form.value.termCount || 1),
);

const closeAddModal = () => {
  showAddModal.value = false;
  form.value = emptyForm();
};

const saveContract = async () => {
  if (!form.value.borrowerId || !form.value.principalAmount) {
    alert('Please fill in required fields');
    return;
  }

  const payload: CreateContractRequest = {
    borrowerId: form.value.borrowerId,
    principalAmount: form.value.principalAmount,
    interestRate: form.value.interestRate,
    interestMode: form.value.interestMode as InterestMode,
    termType: form.value.termType as TermType,
    termCount: form.value.termCount,
    liquidationRate: form.value.liquidationRate || undefined,
    startDate: form.value.startDate,
    notes: form.value.notes || undefined,
  };

  try {
    await store.addContract(payload);
    closeAddModal();
  } catch (err) {
    alert((err as Error).message);
  }
};

const viewDetails = (contract: Contract) => {
  selectedContract.value = contract;
  showDetailsModal.value = true;
};

const handleDeleteContract = async () => {
  if (!selectedContract.value) return;
  const yes = await confirm({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this contract? All associated payments will also be deleted.',
    confirmText: 'Delete',
    destructive: true,
  });
  if (yes) {
    try {
      await store.deleteContract(selectedContract.value.id);
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
.search-container {
  margin: 0 12px 12px 12px;
}

.search-container ion-searchbar {
  --background: white;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0;
}

ion-list { background: transparent; padding: 0 12px; }

ion-item {
  --padding-start: 0; --padding-end: 0;
  --background: white; --border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --min-height: auto; cursor: pointer;
}

.contract-item-content { width: 100%; padding: 14px; }

.contract-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.borrower-info { display: flex; align-items: center; gap: 10px; }
.borrower-info ion-icon { font-size: 32px; }
.borrower-info h2 { margin: 0; font-weight: 700; font-size: 16px; color: var(--ion-color-dark); }

.contract-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
.detail-row { display: flex; flex-direction: column; gap: 2px; }
.detail-row.highlight { background: rgba(var(--ion-color-primary-rgb), 0.05); padding: 6px 8px; border-radius: 6px; }
.detail-row .label { font-size: 11px; color: var(--ion-color-medium); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.detail-row .value { font-size: 13px; font-weight: 600; color: var(--ion-color-dark); }
.detail-row .value.primary { color: var(--ion-color-primary); font-weight: 700; }
.detail-row .value.balance { color: var(--ion-color-warning); font-weight: 700; font-size: 14px; }

.contract-footer { border-top: 1px solid var(--ion-color-light); padding-top: 8px; }
.term-info { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ion-color-medium-shade); }
.term-info ion-icon { font-size: 14px; }

.form-item {
  --background: white; --border-radius: 8px;
  --padding-start: 12px; --padding-end: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  font-size: 14px;
}
.form-item.readonly { --background: rgba(var(--ion-color-light-rgb), 0.3); }

.save-button { margin-top: 16px; height: 44px; font-weight: 700; --border-radius: 12px; }

/* Details modal styles */
.status-card {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  border-radius: 12px; padding: 16px; margin-bottom: 16px;
}
.borrower-header { display: flex; align-items: center; gap: 12px; }
.borrower-header ion-icon { color: white; }
.borrower-header h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: white; }

.detail-card { background: white; border-radius: 12px; padding: 12px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.detail-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(var(--ion-color-light-rgb), 0.5); }
.detail-item:last-child { border-bottom: none; }
.detail-item.highlight { background: rgba(var(--ion-color-primary-rgb), 0.05); padding: 12px; margin: 8px -12px; border-radius: 8px; border-bottom: none; }
.detail-label { font-size: 13px; color: var(--ion-color-medium); font-weight: 600; }
.detail-value { font-size: 15px; font-weight: 700; color: var(--ion-color-dark); }
.detail-value.primary { color: var(--ion-color-primary); }
.detail-value.balance { color: var(--ion-color-warning); }

.notes-card { background: rgba(var(--ion-color-light-rgb), 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px; }
.notes-card p { margin: 0; font-size: 14px; line-height: 1.6; }

.delete-button { margin-top: 8px; height: 48px; font-weight: 600; --border-radius: 12px; }
</style>
