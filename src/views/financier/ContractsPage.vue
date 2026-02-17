<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mga Utang</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Statistics Card -->
      <ion-card class="stats-card">
        <ion-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <ion-icon :icon="documentTextOutline" color="teriary"></ion-icon>
              <div>
                <h3>{{ store.contracts.value.length }}</h3>
                <p>Total sa mga Utang</p>
              </div>
            </div>
            <div class="stat-item">
              <ion-icon :icon="trendingUpOutline" color="success"></ion-icon>
              <div>
                <h3>₱{{ store.totalLentAmount.value.toLocaleString() }}</h3>
                <p>Total Giutang</p>
              </div>
            </div>
            <div class="stat-item">
              <ion-icon :icon="walletOutline" color="warning"></ion-icon>
              <div>
                <h3>₱{{ store.totalOutstanding.value.toLocaleString() }}</h3>
                <p>Wala pa ma bayari na Utang</p>
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <div class="header-actions">
        <ion-button expand="block" @click="showAddModal = true">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
          Bag-ong Utang
        </ion-button>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search by borrower name..."
          :debounce="300"
          show-clear-button="focus"
        ></ion-searchbar>
      </div>

      <!-- Contracts List -->
      <ion-list v-if="filteredContracts.length > 0" lines="none">
        <ion-item v-for="contract in filteredContracts" :key="contract.id" @click="viewDetails(contract)" button>
          <div class="contract-item-content">
            <div class="contract-header">
              <div class="borrower-info">
                <ion-icon :icon="personCircleOutline" color="primary"></ion-icon>
                <h2>{{ contract.borrowerName }}</h2>
              </div>
              <ion-badge :color="getStatusColor(contract.status)">{{ contract.status.toUpperCase() }}</ion-badge>
            </div>
            
            <div class="contract-details">
              <div class="detail-row">
                <span class="label">Principal:</span>
                <span class="value primary">₱{{ contract.principalAmount.toFixed(2) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Interest:</span>
                <span class="value">{{ contract.interestRate.toFixed(2) }}%</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value primary">₱{{ contract.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="detail-row highlight">
                <span class="label">Balance:</span>
                <span class="value balance">₱{{ contract.remainingBalance.toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="contract-footer">
              <div class="term-info">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <span>{{ formatDate(contract.startDate) }} - {{ formatDate(contract.dueDate) }}</span>
              </div>
            </div>
          </div>
        </ion-item>
      </ion-list>

      <ion-card v-else class="empty-state">
        <ion-icon :icon="documentTextOutline" size="large"></ion-icon>
        <ion-card-content>
          <p>{{ searchQuery ? 'No contracts found matching your search.' : 'No contracts yet. Create your first contract.' }}</p>
        </ion-card-content>
      </ion-card>

      <!-- Add Contract Modal -->
      <ion-modal :is-open="showAddModal" @did-dismiss="closeModal" class="contract-modal">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Bag-ong Utang</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="modal-content">
            <!-- Borrower Information -->
            <div class="section-header">
              <ion-icon :icon="personOutline"></ion-icon>
              <h3>Borrower Information</h3>
            </div>
            
            <ion-item class="form-item">
              <ion-select 
                v-model="formData.borrowerId" 
                label="Pala-Utang (Borrower)" 
                label-placement="floating"
                @ion-change="selectBorrower"
                interface="action-sheet"
              >
                <ion-select-option 
                  v-for="borrower in store.borrowers.value" 
                  :key="borrower.id" 
                  :value="borrower.id"
                >
                  {{ borrower.name || `${borrower.firstName} ${borrower.lastName}` }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <!-- Contract Terms -->
            <div class="section-header">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <h3>Contract Terms</h3>
            </div>

            <ion-item class="form-item">
              <ion-select 
                v-model="formData.termType" 
                label="Term Type" 
                label-placement="floating"
                interface="action-sheet"
                @ion-change="updateAmountPerTerm"
              >
                <ion-select-option value="daily">Daily</ion-select-option>
                <ion-select-option value="weekly">Weekly</ion-select-option>
                <ion-select-option value="monthly">Monthly</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="form-item">
              <ion-input 
                v-model.number="formData.termCount" 
                label="No. of Days/Weeks/Months" 
                label-placement="floating"
                type="number"
                placeholder="12"
                @ion-input="updateAmountPerTerm"
              ></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-input 
                v-model="formData.startDate" 
                label="Start Date" 
                label-placement="floating"
                type="date"
              ></ion-input>
            </ion-item>

            <!-- Financial Details -->
            <div class="section-header">
              <ion-icon :icon="cashOutline"></ion-icon>
              <h3>Financial Details</h3>
            </div>

            <ion-item class="form-item">
              <ion-input 
                v-model.number="formData.principalAmount" 
                label="Principal Amount (₱)" 
                label-placement="floating"
                type="number"
                placeholder="10000"
                @ion-input="updateAmountPerTerm"
              ></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-input 
                v-model.number="formData.interestRate" 
                label="Interest Rate (%)" 
                label-placement="floating"
                type="number"
                placeholder="5"
                @ion-input="updateAmountPerTerm"
              ></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-select 
                v-model="formData.interestMode" 
                label="Interest Mode" 
                label-placement="floating"
                interface="action-sheet"
                @ion-change="updateAmountPerTerm"
              >
                <ion-select-option value="simple">Simple Interest</ion-select-option>
                <ion-select-option value="compound">Compound Interest</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="form-item">
              <ion-input 
                v-model.number="formData.liquidationRate" 
                label="Liquidation Rate (%)" 
                label-placement="floating"
                type="number"
                placeholder="2"
              ></ion-input>
            </ion-item>

            <!-- Payment Summary -->
            <div class="section-header">
              <ion-icon :icon="calculatorOutline"></ion-icon>
              <h3>Payment Summary</h3>
            </div>

            <ion-item class="form-item readonly">
              <ion-input 
                :value="'₱' + calculateAmountPerTerm().toLocaleString()" 
                label="Amount per Day/Week/Month" 
                label-placement="floating"
                readonly
              ></ion-input>
            </ion-item>

            <ion-item class="form-item readonly">
              <ion-input 
                :value="'₱' + calculateTotal().toLocaleString()" 
                label="Total Amount Payable" 
                label-placement="floating"
                readonly
              ></ion-input>
            </ion-item>

            <!-- Additional Notes -->
            <div class="section-header">
              <ion-icon :icon="documentTextOutline"></ion-icon>
              <h3>Additional Information</h3>
            </div>

            <ion-item class="form-item">
              <ion-textarea 
                v-model="formData.notes" 
                label="Notes (Optional)" 
                label-placement="floating"
                :rows="2"
                placeholder="Contract terms and conditions"
              ></ion-textarea>
            </ion-item>

            <ion-button expand="block" color="primary" @click="saveContract" class="save-button">
              <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
              I-save ang Utang
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Contract Details Modal -->
      <ion-modal :is-open="showDetailsModal" @did-dismiss="showDetailsModal = false" class="details-modal">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Contract Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showDetailsModal = false">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content v-if="selectedContract">
          <div class="modal-content">
            <!-- Status Header -->
            <div class="status-card">
              <div class="borrower-header">
                <ion-icon :icon="personCircleOutline" size="large"></ion-icon>
                <div>
                  <h2>{{ selectedContract.borrowerName }}</h2>
                  <ion-badge :color="getStatusColor(selectedContract.status)" class="status-badge">
                    {{ selectedContract.status.toUpperCase() }}
                  </ion-badge>
                </div>
              </div>
            </div>

            <!-- Financial Summary -->
            <div class="section-header">
              <ion-icon :icon="cashOutline"></ion-icon>
              <h3>Financial Summary</h3>
            </div>
            
            <div class="detail-card">
              <div class="detail-item">
                <span class="detail-label">Principal Amount</span>
                <span class="detail-value">₱{{ selectedContract.principalAmount.toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Interest Rate</span>
                <span class="detail-value">{{ selectedContract.interestRate.toFixed(2) }}%</span>
              </div>
              <div class="detail-item highlight">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value primary">₱{{ selectedContract.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="detail-item highlight">
                <span class="detail-label">Remaining Balance</span>
                <span class="detail-value balance">₱{{ selectedContract.remainingBalance.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Term Information -->
            <div class="section-header">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <h3>Term Information</h3>
            </div>
            
            <div class="detail-card">
              <div class="detail-item">
                <span class="detail-label">Term Duration</span>
                <span class="detail-value">{{ selectedContract.termMonths.toFixed(0) }} months</span>
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

            <!-- Notes -->
            <div v-if="selectedContract.notes" class="section-header">
              <ion-icon :icon="documentTextOutline"></ion-icon>
              <h3>Notes</h3>
            </div>
            
            <div v-if="selectedContract.notes" class="notes-card">
              <p>{{ selectedContract.notes }}</p>
            </div>

            <!-- Actions -->
            <ion-button 
              expand="block" 
              color="danger" 
              @click="confirmDeleteContract"
              class="delete-button"
            >
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              Delete Contract
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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonNote,
  IonSearchbar,
  alertController,
} from '@ionic/vue';
import {
  addOutline,
  eyeOutline,
  logOutOutline,
  documentTextOutline,
  trendingUpOutline,
  walletOutline,
  closeOutline,
  checkmarkOutline,
  personOutline,
  calendarOutline,
  cashOutline,
  calculatorOutline,
  personCircleOutline,
  trashOutline,
  searchOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { UtangContract } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showAddModal = ref(false);
const showDetailsModal = ref(false);
const selectedContract = ref<UtangContract | null>(null);
const searchQuery = ref('');

// Filtered and sorted contracts
const filteredContracts = computed(() => {
  let contracts = [...store.contracts.value];
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    contracts = contracts.filter(contract => 
      contract.borrowerName.toLowerCase().includes(query)
    );
  }
  
  // Sort alphabetically by borrower name
  contracts.sort((a, b) => 
    a.borrowerName.localeCompare(b.borrowerName)
  );
  
  return contracts;
});

const formData = ref({
  borrowerId: '',
  borrowerName: '',
  principalAmount: 0,
  interestRate: 0,
  termType: 'monthly',
  termCount: 1,
  interestMode: 'simple',
  liquidationRate: 0,
  startDate: new Date().toISOString().split('T')[0],
  notes: '',
});

const resetForm = () => {
  formData.value = {
    borrowerId: '',
    borrowerName: '',
    principalAmount: 0,
    interestRate: 0,
    termType: 'monthly',
    termCount: 1,
    interestMode: 'simple',
    liquidationRate: 0,
    startDate: new Date().toISOString().split('T')[0],
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
    formData.value.borrowerName = borrower.name || `${borrower.firstName} ${borrower.lastName}`;
  }
};

const calculateTotal = () => {
  const principal = formData.value.principalAmount || 0;
  const rate = formData.value.interestRate || 0;
  
  if (formData.value.interestMode === 'simple') {
    return principal + (principal * rate / 100);
  } else {
    // Compound interest
    return principal * Math.pow(1 + (rate / 100), 1);
  }
};

const calculateAmountPerTerm = () => {
  const total = calculateTotal();
  const termCount = formData.value.termCount || 1;
  return total / termCount;
};

const updateAmountPerTerm = () => {
  // This function is called to trigger reactive updates
  calculateAmountPerTerm();
};

const saveContract = () => {
  if (!formData.value.borrowerId || !formData.value.principalAmount) {
    alert('Please fill in required fields');
    return;
  }

  const startDate = new Date(formData.value.startDate);
  const dueDate = new Date(startDate);
  
  // Calculate due date based on term type
  if (formData.value.termType === 'daily') {
    dueDate.setDate(dueDate.getDate() + formData.value.termCount);
  } else if (formData.value.termType === 'weekly') {
    dueDate.setDate(dueDate.getDate() + (formData.value.termCount * 7));
  } else {
    dueDate.setMonth(dueDate.getMonth() + formData.value.termCount);
  }

  store.addContract({
    borrowerId: formData.value.borrowerId,
    borrowerName: formData.value.borrowerName,
    principalAmount: formData.value.principalAmount,
    interestRate: formData.value.interestRate,
    termMonths: formData.value.termType === 'monthly' ? formData.value.termCount : 
                 formData.value.termType === 'weekly' ? formData.value.termCount / 4 :
                 formData.value.termCount / 30,
    startDate: startDate,
    dueDate: dueDate,
    status: 'active',
    totalAmount: calculateTotal(),
    notes: formData.value.notes,
  });

  closeModal();
};

const viewDetails = (contract: UtangContract) => {
  selectedContract.value = contract;
  showDetailsModal.value = true;
};

const confirmDeleteContract = async () => {
  if (!selectedContract.value) return;

  const alert = await alertController.create({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this contract? All associated payments will also be deleted.',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          store.deleteContract(selectedContract.value!.id);
          showDetailsModal.value = false;
        },
      },
    ],
  });

  await alert.present();
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
.stats-card {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  color: white;
  margin: 8px 12px 12px 12px;
}

.stats-card ion-card-content {
  padding: 10px;
}

.stats-grid {
  display: grid;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-item ion-icon {
  font-size: 32px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-item h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: white;
}

.stat-item p {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.header-actions {
  margin: 0 12px 16px 12px;
}

.header-actions ion-button {
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
  font-weight: 600;
  height: 48px;
}

.search-container {
  margin: 0 12px 12px 12px;
}

.search-container ion-searchbar {
  --background: white;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0;
}

ion-list {
  background: transparent;
  padding: 0 12px;
}

ion-item {
  --padding-start: 0;
  --padding-end: 0;
  --background: white;
  --border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --min-height: auto;
  transition: all 0.2s ease;
  cursor: pointer;
}

ion-item:active {
  transform: scale(0.98);
}

.contract-item-content {
  width: 100%;
  padding: 14px;
}

.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.borrower-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.borrower-info ion-icon {
  font-size: 32px;
}

.borrower-info h2 {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: var(--ion-color-dark);
}

.contract-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-row.highlight {
  background: rgba(var(--ion-color-primary-rgb), 0.05);
  padding: 6px 8px;
  border-radius: 6px;
}

.detail-row .label {
  font-size: 11px;
  color: var(--ion-color-medium);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-row .value {
  font-size: 13px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.detail-row .value.primary {
  color: var(--ion-color-primary);
  font-weight: 700;
}

.detail-row .value.balance {
  color: var(--ion-color-warning);
  font-weight: 700;
  font-size: 14px;
}

.contract-footer {
  border-top: 1px solid var(--ion-color-light);
  padding-top: 8px;
}

.term-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ion-color-medium-shade);
}

.term-info ion-icon {
  font-size: 14px;
}

ion-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 10px;
  letter-spacing: 0.5px;
}

ion-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 12px;
}

ion-card-header {
  padding-bottom: 8px;
}

ion-card-title {
  font-size: 20px;
  font-weight: 700;
}

.calculation-summary {
  background: linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.1), rgba(var(--ion-color-secondary-rgb), 0.1));
  border-radius: 12px;
  margin: 15px 0;
  border: 2px solid rgba(var(--ion-color-primary-rgb), 0.2);
}

.calculation-summary p {
  font-size: 18px;
  margin: 0;
}

ion-modal ion-item {
  --background: transparent;
  box-shadow: none;
  border-bottom: 1px solid var(--ion-color-light);
  border-radius: 0;
  margin-bottom: 0;
  --min-height: 56px;
}

.contract-modal {
  --border-radius: 8px 8px 0 0;
}

.modal-content {
  padding: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--ion-color-primary);
}

.section-header:first-child {
  margin-top: 0;
}

.section-header ion-icon {
  font-size: 18px;
  color: var(--ion-color-primary);
}

.section-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ion-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-item {
  --background: white;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --min-height: 40px;
  --color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-medium-shade);
  --placeholder-opacity: 0.8;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  font-size: 14px;
}

.form-item ion-input,
.form-item ion-textarea,
.form-item ion-select {
  --padding-top: 4px;
  --padding-bottom: 4px;
  --color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-medium-shade);
  --placeholder-opacity: 0.8;
  font-size: 14px;
}

.form-item ion-label {
  font-size: 12px;
  color: var(--ion-color-dark);
  font-weight: 600;
}

.form-item.readonly {
  --background: rgba(var(--ion-color-light-rgb), 0.3);
}

.form-item.readonly ion-input {
  font-weight: 600;
  color: var(--ion-color-primary);
}

.save-button {
  margin-top: 16px;
  height: 44px;
  font-weight: 700;
  font-size: 15px;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
}

ion-modal ion-button {
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
}

ion-note {
  font-weight: 600;
  font-size: 15px;
}

/* Details Modal Styles */
.details-modal .modal-content {
  padding: 12px;
}

.status-card {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.borrower-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.borrower-header ion-icon {
  color: white;
}

.borrower-header h2 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(var(--ion-color-light-rgb), 0.5);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item.highlight {
  background: rgba(var(--ion-color-primary-rgb), 0.05);
  padding: 12px;
  margin: 8px -12px;
  border-radius: 8px;
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: var(--ion-color-medium);
  font-weight: 600;
}

.detail-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--ion-color-dark);
}

.detail-value.primary {
  color: var(--ion-color-primary);
  font-size: 16px;
}

.detail-value.balance {
  color: var(--ion-color-warning);
  font-size: 16px;
}

.notes-card {
  background: rgba(var(--ion-color-light-rgb), 0.3);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.notes-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ion-color-dark);
}

.delete-button {
  margin-top: 8px;
  height: 48px;
  font-weight: 600;
  --border-radius: 12px;
}
</style>
