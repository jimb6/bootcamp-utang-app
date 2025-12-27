<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Payments</ion-title>
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
          Record Payment
        </ion-button>
      </div>

      <!-- Payments List -->
      <ion-list v-if="store.payments.value.length > 0">
        <ion-item v-for="payment in sortedPayments" :key="payment.id">
          <ion-icon :icon="cashOutline" slot="start" color="success"></ion-icon>
          <ion-label>
            <h2>₱{{ payment.amount.toLocaleString() }}</h2>
            <p>{{ getContractInfo(payment.contractId) }}</p>
            <p>{{ formatDate(payment.paymentDate) }}</p>
            <p v-if="payment.receiptNumber">Receipt: {{ payment.receiptNumber }}</p>
          </ion-label>
          <ion-button fill="clear" color="danger" @click="confirmDelete(payment.id)">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <ion-card v-else class="empty-state">
        <ion-icon :icon="cashOutline" size="large"></ion-icon>
        <ion-card-content>
          <p>No payments recorded yet.</p>
        </ion-card-content>
      </ion-card>

      <!-- Add Payment Modal -->
      <ion-modal :is-open="showAddModal" @did-dismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Record Payment</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-select 
              v-model="formData.contractId" 
              label="Contract" 
              label-placement="floating"
              @ion-change="selectContract"
            >
              <ion-select-option 
                v-for="contract in activeContracts" 
                :key="contract.id" 
                :value="contract.id"
              >
                {{ contract.borrowerName }} - ₱{{ contract.remainingBalance.toLocaleString() }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          
          <ion-card v-if="selectedContract">
            <ion-card-content>
              <p><strong>Borrower:</strong> {{ selectedContract.borrowerName }}</p>
              <p><strong>Remaining Balance:</strong> ₱{{ selectedContract.remainingBalance.toLocaleString() }}</p>
            </ion-card-content>
          </ion-card>

          <ion-item>
            <ion-input 
              v-model.number="formData.amount" 
              label="Amount (₱)" 
              label-placement="floating"
              type="number"
              placeholder="1000"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input 
              v-model="formData.paymentDate" 
              label="Payment Date" 
              label-placement="floating"
              type="date"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input 
              v-model="formData.receiptNumber" 
              label="Receipt Number" 
              label-placement="floating"
              placeholder="OR-12345"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-textarea 
              v-model="formData.notes" 
              label="Notes" 
              label-placement="floating"
              :rows="2"
              placeholder="Payment details"
            ></ion-textarea>
          </ion-item>
          <ion-button expand="block" @click="savePayment" class="ion-margin-top">
            Record Payment
          </ion-button>
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
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  alertController,
} from '@ionic/vue';
import {
  addOutline,
  cashOutline,
  trashOutline,
  logOutOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { UtangContract } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showAddModal = ref(false);
const selectedContract = ref<UtangContract | null>(null);

const formData = ref({
  contractId: '',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  receiptNumber: '',
  notes: '',
});

const activeContracts = computed(() => {
  return store.contracts.value.filter(c => c.status === 'active' && c.remainingBalance > 0);
});

const sortedPayments = computed(() => {
  return [...store.payments.value].sort((a, b) => 
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );
});

const resetForm = () => {
  formData.value = {
    contractId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    notes: '',
  };
  selectedContract.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const selectContract = () => {
  const contract = store.contracts.value.find(c => c.id === formData.value.contractId);
  if (contract) {
    selectedContract.value = contract;
  }
};

const getContractInfo = (contractId: string) => {
  const contract = store.contracts.value.find(c => c.id === contractId);
  return contract ? `${contract.borrowerName} - Contract` : 'Unknown Contract';
};

const savePayment = () => {
  if (!formData.value.contractId || !formData.value.amount) {
    alert('Please fill in required fields');
    return;
  }

  if (selectedContract.value && formData.value.amount > selectedContract.value.remainingBalance) {
    alert(`Payment amount cannot exceed remaining balance of ₱${selectedContract.value.remainingBalance.toLocaleString()}`);
    return;
  }

  store.addPayment({
    contractId: formData.value.contractId,
    amount: formData.value.amount,
    paymentDate: new Date(formData.value.paymentDate),
    receiptNumber: formData.value.receiptNumber,
    notes: formData.value.notes,
  });

  closeModal();
};

const confirmDelete = async (id: string) => {
  const alert = await alertController.create({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this payment? The contract balance will be adjusted.',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          store.deletePayment(id);
        },
      },
    ],
  });

  await alert.present();
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
  --min-height: 88px;
  transition: all 0.2s ease;
}

ion-item:active {
  transform: scale(0.98);
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

ion-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 16px 0;
  border-left: 4px solid var(--ion-color-success);
}

ion-card-content p {
  margin: 8px 0;
  font-size: 15px;
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
</style>
