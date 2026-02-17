<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>UTANG APP</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="role-selection-container">
        <div class="header-section">
          <ion-icon :icon="cashOutline" size="large" color="primary"></ion-icon>
          <h1>Welcome to UTANG APP</h1>
          <p>Utang Lipay-Lipay, Bayad Likay-Likay</p>
        </div>

        <div class="role-cards">
          <ion-card button @click="selectRole('financier')" class="role-card">
            <ion-card-content>
              <div class="card-icon">
                <ion-icon :icon="walletOutline" size="large" color="success"></ion-icon>
              </div>
              <ion-card-title>Listahan sa mga Utang</ion-card-title>
              <ion-card-subtitle>List of Debts</ion-card-subtitle>
              <p class="role-description">
                Manage borrowers, create contracts, track payments and create loan offers
              </p>
            </ion-card-content>
          </ion-card>

          <!-- <ion-card button @click="showBorrowerSelection = true" class="role-card">
            <ion-card-content>
              <div class="card-icon">
                <ion-icon :icon="personOutline" size="large" color="warning"></ion-icon>
              </div>
              <ion-card-title>Pala-Utang</ion-card-title>
              <ion-card-subtitle>Borrower</ion-card-subtitle>
              <p class="role-description">
                View contracts, track payments, see offers and monitor balance
              </p>
            </ion-card-content>
          </ion-card> -->
        </div>
      </div>

      <!-- Borrower Selection Modal -->
      <ion-modal :is-open="showBorrowerSelection" @did-dismiss="showBorrowerSelection = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Select Borrower</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showBorrowerSelection = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list v-if="store.borrowers.value.length > 0">
            <ion-item 
              button 
              v-for="borrower in store.borrowers.value" 
              :key="borrower.id"
              @click="selectBorrower(borrower.id)"
            >
              <ion-icon :icon="personCircleOutline" slot="start"></ion-icon>
              <ion-label>
                <h2>{{ borrower.name }}</h2>
                <p>{{ borrower.email }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          <ion-card v-else>
            <ion-card-content>
              <p class="ion-text-center">No borrowers found. Contact your financier to create an account.</p>
            </ion-card-content>
          </ion-card>
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
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonModal,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/vue';
import { 
  cashOutline, 
  walletOutline, 
  personOutline, 
  personCircleOutline 
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';

const router = useRouter();
const store = useUtangStore();
const showBorrowerSelection = ref(false);

const selectRole = (role: 'financier') => {
  store.setCurrentUser(role);
  router.push('/financier/contracts');
};

const selectBorrower = (borrowerId: string) => {
  store.setCurrentUser('borrower', borrowerId);
  showBorrowerSelection.value = false;
  router.push('/borrower/contracts');
};
</script>

<style scoped>
.role-selection-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 16px;
  background: linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.05) 0%, rgba(var(--ion-color-secondary-rgb), 0.05) 100%);
}

.header-section {
  text-align: center;
  margin-bottom: 24px;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-section ion-icon {
  font-size: 64px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.header-section h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 8px 0;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-section p {
  font-size: 10px;
  font-weight: 800;
  margin: 8px 0;
  background: linear-gradient(135deg, var(--ion-color-medium), var(--ion-color-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-section p {
  font-size: 15px;
  color: var(--ion-color-medium);
  font-weight: 500;
  margin: 4px 0 0 0;
}

.role-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 500px;
}

.role-card {
  margin: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 1));
  border: 2px solid transparent;
}

.role-card ion-card-content {
  padding: 20px 16px;
}

.role-card:active {
  transform: scale(0.98);
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--ion-color-primary);
}

.card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(var(--ion-color-success-rgb), 0.1), rgba(var(--ion-color-success-rgb), 0.05));
  border-radius: 50%;
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
}

.card-icon ion-icon {
  font-size: 44px;
}

ion-card-title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4px;
  color: var(--ion-color-dark);
}

ion-card-subtitle {
  text-align: center;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.role-description {
  text-align: center;
  color: var(--ion-color-medium);
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.4;
  padding: 0 4px;
}

@media (min-width: 768px) {
  .role-cards {
    flex-direction: row;
    max-width: 900px;
    gap: 20px;
  }
}
</style>
