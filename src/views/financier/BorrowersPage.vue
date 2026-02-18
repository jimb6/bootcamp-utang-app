<template>
  <ion-page>
    <AppPageHeader title="Mga Pala-Utang" :show-logout="true" @logout="logout" />
    <ion-content>
      <AppStatsCard :stats="statsItems" />
      <AppActionButton label="Bag-ong Pala-Utang" :icon="addOutline" @click="showModal = true" />

      <!-- Borrowers List -->
      <ion-list v-if="store.borrowers.value.length > 0" lines="none">
        <ion-item v-for="borrower in store.borrowers.value" :key="borrower.id">
          <ion-icon :icon="personCircleOutline" slot="start" color="primary" />
          <ion-label>
            <h2>{{ borrower.fullName }}</h2>
            <p>{{ borrower.phone }}</p>
            <p class="address-text">{{ borrower.address }}</p>
          </ion-label>
          <ion-button fill="clear" @click="openEdit(borrower)">
            <ion-icon :icon="createOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click="handleDelete(borrower.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>

      <AppEmptyState
        v-else
        :icon="peopleOutline"
        message="No borrowers yet. Add your first borrower to get started."
      />

      <!-- Add / Edit Modal -->
      <AppFormModal :is-open="showModal" :title="editing ? 'I-edit Pala-Utang' : 'Bag-o Pala-Utang'" @close="closeModal">
        <AppSectionHeader :icon="personOutline" title="Personal Information" />
        <div class="form-row">
          <ion-input v-model="form.firstName" label="First Name" label-placement="floating" fill="outline" placeholder="Juan" class="form-input" />
          <ion-input v-model="form.lastName" label="Last Name" label-placement="floating" fill="outline" placeholder="Dela Cruz" class="form-input" />
        </div>
        <ion-input v-model="form.birthDate" label="Birth Date" label-placement="floating" fill="outline" type="date" class="form-input" />

        <AppSectionHeader :icon="callOutline" title="Contact Information" />
        <ion-input v-model="form.phone" label="Contact Number" label-placement="floating" fill="outline" type="tel" placeholder="09xx-xxx-xxxx" class="form-input" />
        <ion-input v-model="form.email" label="Email (Optional)" label-placement="floating" fill="outline" type="email" placeholder="email@example.com" class="form-input" />
        <ion-textarea v-model="form.address" label="Address" label-placement="floating" fill="outline" :rows="2" placeholder="Complete address" class="form-input" />

        <AppSectionHeader :icon="alertCircleOutline" title="Emergency Contact" />
        <ion-input v-model="form.emergencyContactName" label="Full Name" label-placement="floating" fill="outline" placeholder="Emergency contact name" class="form-input" />
        <ion-input v-model="form.emergencyContactPhone" label="Contact Number" label-placement="floating" fill="outline" type="tel" placeholder="09xx-xxx-xxxx" class="form-input" />

        <ion-button expand="block" color="primary" @click="save" class="save-button">
          <ion-icon :icon="checkmarkOutline" slot="start" />
          {{ editing ? 'I-update' : 'I-save' }}
        </ion-button>
      </AppFormModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonInput, IonTextarea, onIonViewWillEnter } from '@ionic/vue';
import { personCircleOutline, addOutline, createOutline, trashOutline, peopleOutline, checkmarkOutline, callOutline, alertCircleOutline, personOutline } from 'ionicons/icons';
import AppPageHeader from '@/components/AppPageHeader.vue';
import AppStatsCard from '@/components/AppStatsCard.vue';
import type { StatItem } from '@/components/AppStatsCard.vue';
import AppActionButton from '@/components/AppActionButton.vue';
import AppEmptyState from '@/components/AppEmptyState.vue';
import AppFormModal from '@/components/AppFormModal.vue';
import AppSectionHeader from '@/components/AppSectionHeader.vue';
import { useUtangStore } from '@/composables/useUtangStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import type { Borrower, CreateBorrowerRequest } from '@/types';

const router = useRouter();
const store = useUtangStore();
const { confirm } = useConfirmDialog();

const showModal = ref(false);
const editing = ref<Borrower | null>(null);

onIonViewWillEnter(() => {
  store.fetchBorrowers();
});

const emptyForm = (): CreateBorrowerRequest => ({
  firstName: '',
  lastName: '',
  birthDate: '',
  email: '',
  phone: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
});

const form = ref<CreateBorrowerRequest>(emptyForm());

const statsItems = computed<StatItem[]>(() => [
  { icon: peopleOutline, iconColor: 'tertiary', value: store.borrowers.value.length, label: 'Numero sa mga Pala-Utang' },
]);

const openEdit = (borrower: Borrower) => {
  editing.value = borrower;
  form.value = {
    firstName: borrower.firstName,
    lastName: borrower.lastName,
    birthDate: borrower.birthDate,
    email: borrower.email,
    phone: borrower.phone,
    address: borrower.address,
    emergencyContactName: borrower.emergencyContactName,
    emergencyContactPhone: borrower.emergencyContactPhone,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editing.value = null;
  form.value = emptyForm();
};

const save = async () => {
  if (!form.value.firstName || !form.value.lastName || !form.value.phone) {
    alert('Please fill in required fields (First Name, Last Name, Contact Number)');
    return;
  }

  try {
    if (editing.value) {
      await store.updateBorrower(editing.value.id, form.value);
    } else {
      await store.addBorrower(form.value);
    }
    closeModal();
  } catch (err) {
    alert((err as Error).message);
  }
};

const handleDelete = async (id: number) => {
  const yes = await confirm({
    header: 'Confirm Delete',
    message: 'Are you sure you want to delete this borrower?',
    confirmText: 'Delete',
    destructive: true,
  });
  if (yes) {
    try {
      await store.deleteBorrower(id);
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
.address-text {
  color: var(--ion-color-medium);
  font-size: 0.9em;
}

ion-list {
  background: transparent;
  padding: 0 12px;
}

ion-item {
  --background: white;
  --border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --min-height: 80px;
}

ion-label h2 {
  font-weight: 600;
  font-size: 18px;
  color: var(--ion-color-dark);
  margin-bottom: 4px;
}

ion-label p {
  font-size: 14px;
  line-height: 1.4;
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-row .form-input {
  flex: 1;
}

.form-input {
  margin-bottom: 8px;
  --color: #222 !important;
  --placeholder-color: #999 !important;
  --background: #fff !important;
  --border-color: #c8c8c8;
  --highlight-color-focused: var(--ion-color-primary);
  color: #222 !important;
}

.form-input .label-text {
  color: #555 !important;
}

.save-button {
  margin-top: 16px;
  height: 44px;
  font-weight: 700;
  --border-radius: 12px;
}
</style>
