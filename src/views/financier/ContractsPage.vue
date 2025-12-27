<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Utang Contracts</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Statistics Card -->
      <ion-card class="stats-card">
        <ion-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <ion-icon :icon="documentTextOutline" color="primary"></ion-icon>
              <div>
                <h3>{{ store.contracts.value.length }}</h3>
                <p>Total Contracts</p>
              </div>
            </div>
            <div class="stat-item">
              <ion-icon :icon="trendingUpOutline" color="success"></ion-icon>
              <div>
                <h3>₱{{ store.totalLentAmount.value.toLocaleString() }}</h3>
                <p>Total Lent</p>
              </div>
            </div>
            <div class="stat-item">
              <ion-icon :icon="walletOutline" color="warning"></ion-icon>
              <div>
                <h3>₱{{ store.totalOutstanding.value.toLocaleString() }}</h3>
                <p>Outstanding</p>
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <div class="header-actions">
        <ion-button expand="block" @click="showAddModal = true">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
          Create Contract
        </ion-button>
      </div>

      <!-- Contracts List -->
      <ion-list v-if="store.contracts.value.length > 0">
        <ion-item v-for="contract in store.contracts.value" :key="contract.id">
          <ion-label>
            <h2>{{ contract.borrowerName }}</h2>
            <p>Principal: ₱{{ contract.principalAmount.toLocaleString() }}</p>
            <p>Total: ₱{{ contract.totalAmount.toLocaleString() }} | Balance: ₱{{ contract.remainingBalance.toLocaleString() }}</p>
            <p>{{ contract.termMonths }} months @ {{ contract.interestRate }}%</p>
            <ion-badge :color="getStatusColor(contract.status)">{{ contract.status.toUpperCase() }}</ion-badge>
          </ion-label>
          <ion-button fill="clear" @click="viewDetails(contract)">
            <ion-icon :icon="eyeOutline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <ion-card v-else class="empty-state">
        <ion-icon :icon="documentTextOutline" size="large"></ion-icon>
        <ion-card-content>
          <p>No contracts yet. Create your first contract.</p>
        </ion-card-content>
      </ion-card>

      <!-- Add Contract Modal -->
      <ion-modal :is-open="showAddModal" @did-dismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Create Contract</ion-title>
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
              v-model.number="formData.principalAmount" 
              label="Principal Amount (₱)" 
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
              v-model="formData.startDate" 
              label="Start Date" 
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
              placeholder="Contract terms and conditions"
            ></ion-textarea>
          </ion-item>
          <div class="calculation-summary ion-padding">
            <p><strong>Total Amount:</strong> ₱{{ calculateTotal().toLocaleString() }}</p>
          </div>
          <ion-button expand="block" @click="saveContract">
            Create Contract
          </ion-button>
        </ion-content>
      </ion-modal>

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
              <ion-card-title>{{ selectedContract.borrowerName }}</ion-card-title>
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

          <ion-button 
            expand="block" 
            color="danger" 
            @click="confirmDeleteContract"
          >
            Delete Contract
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
  eyeOutline,
  logOutOutline,
  documentTextOutline,
  trendingUpOutline,
  walletOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { UtangContract } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showAddModal = ref(false);
const showDetailsModal = ref(false);
const selectedContract = ref<UtangContract | null>(null);

const formData = ref({
  borrowerId: '',
  borrowerName: '',
  principalAmount: 0,
  interestRate: 0,
  termMonths: 0,
  startDate: new Date().toISOString().split('T')[0],
  notes: '',
});

const resetForm = () => {
  formData.value = {
    borrowerId: '',
    borrowerName: '',
    principalAmount: 0,
    interestRate: 0,
    termMonths: 0,
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
    formData.value.borrowerName = borrower.name;
  }
};

const calculateTotal = () => {
  const principal = formData.value.principalAmount || 0;
  const rate = formData.value.interestRate || 0;
  return principal + (principal * rate / 100);
};

const saveContract = () => {
  if (!formData.value.borrowerId || !formData.value.principalAmount) {
    alert('Please fill in required fields');
    return;
  }

  const startDate = new Date(formData.value.startDate);
  const dueDate = new Date(startDate);
  dueDate.setMonth(dueDate.getMonth() + formData.value.termMonths);

  store.addContract({
    borrowerId: formData.value.borrowerId,
    borrowerName: formData.value.borrowerName,
    principalAmount: formData.value.principalAmount,
    interestRate: formData.value.interestRate,
    termMonths: formData.value.termMonths,
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
  margin-bottom: 24px;
}

.stats-card ion-card-content {
  padding: 20px;
}

.stats-grid {
  display: grid;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item ion-icon {
  font-size: 40px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-item h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.stat-item p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

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
