<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Mga Pala-Utang</ion-title>
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
                            <ion-icon :icon="peopleOutline" color="primary"></ion-icon>
                            <div>
                                <h3>{{ store.borrowers.value.length }}</h3>
                                <p>Total Borrowers</p>
                            </div>
                        </div>
                    </div>
                </ion-card-content>
            </ion-card>

            <div class="header-actions">
                <ion-button expand="block" @click="showAddModal = true">
                    <ion-icon :icon="addOutline" slot="start"></ion-icon>
                    Bag-ong Pala-Utang
                </ion-button>
            </div>

            <!-- Borrowers List -->
            <ion-list v-if="store.borrowers.value.length > 0">
                <ion-item v-for="borrower in store.borrowers.value" :key="borrower.id">
                    <ion-icon :icon="personCircleOutline" slot="start" color="primary"></ion-icon>
                    <ion-label>
                        <h2>{{ borrower.name }}</h2>
                        <p>{{ borrower.email }} | {{ borrower.phone }}</p>
                        <p class="address-text">{{ borrower.address }}</p>
                    </ion-label>
                    <ion-button fill="clear" @click="editBorrower(borrower)">
                        <ion-icon :icon="createOutline"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" color="danger" @click="confirmDelete(borrower.id)">
                        <ion-icon :icon="trashOutline"></ion-icon>
                    </ion-button>
                </ion-item>
            </ion-list>

            <ion-card v-else class="empty-state">
                <ion-icon :icon="peopleOutline" size="large"></ion-icon>
                <ion-card-content>
                    <p>No borrowers yet. Add your first borrower to get started.</p>
                </ion-card-content>
            </ion-card>

            <!-- Add/Edit Borrower Modal -->
            <ion-modal :is-open="showAddModal" @did-dismiss="closeModal">
                <ion-header>
                    <ion-toolbar>
                        <ion-title>{{ editingBorrower ? 'Edit' : 'Add' }} Borrower</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeModal">Close</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-item>
                        <ion-input v-model="formData.name" label="Name" label-placement="floating"
                            placeholder="Enter full name"></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-input v-model="formData.email" label="Email" label-placement="floating" type="email"
                            placeholder="email@example.com"></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-input v-model="formData.phone" label="Phone" label-placement="floating" type="tel"
                            placeholder="09xx-xxx-xxxx"></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-textarea v-model="formData.address" label="Address" label-placement="floating" :rows="3"
                            placeholder="Enter complete address"></ion-textarea>
                    </ion-item>
                    <ion-button expand="block" @click="saveBorrower" class="ion-margin-top">
                        {{ editingBorrower ? 'Update' : 'Save' }} Borrower
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
    IonModal,
    IonInput,
    IonTextarea,
    alertController,
} from '@ionic/vue';
import {
    personCircleOutline,
    addOutline,
    createOutline,
    trashOutline,
    logOutOutline,
    peopleOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { Borrower } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showAddModal = ref(false);
const editingBorrower = ref<Borrower | null>(null);

const formData = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
});

const resetForm = () => {
    formData.value = {
        name: '',
        email: '',
        phone: '',
        address: '',
    };
    editingBorrower.value = null;
};

const closeModal = () => {
    showAddModal.value = false;
    resetForm();
};

const editBorrower = (borrower: Borrower) => {
    editingBorrower.value = borrower;
    formData.value = {
        name: borrower.name,
        email: borrower.email,
        phone: borrower.phone,
        address: borrower.address,
    };
    showAddModal.value = true;
};

const saveBorrower = () => {
    if (!formData.value.name || !formData.value.email) {
        alert('Please fill in required fields');
        return;
    }

    if (editingBorrower.value) {
        store.updateBorrower(editingBorrower.value.id, formData.value);
    } else {
        store.addBorrower(formData.value);
    }

    closeModal();
};

const confirmDelete = async (id: string) => {
    const alert = await alertController.create({
        header: 'Confirm Delete',
        message: 'Are you sure you want to delete this borrower?',
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: () => {
                    store.deleteBorrower(id);
                },
            },
        ],
    });

    await alert.present();
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
}

.stats-grid {
    display: grid;
    gap: 16px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-item ion-icon {
    font-size: 48px;
    color: var(--ion-color-dark);
}

.stat-item h3 {
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    color: white;
}

.stat-item p {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.header-actions {
    margin: 0 12px 16px 12px;
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.header-actions ion-button {
    --border-radius: 8px;
    --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
    font-weight: 600;
    height: 48px;
}

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
    transition: all 0.2s ease;
}

ion-item:active {
    transform: scale(0.98);
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

ion-card {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);    margin: 12px;}

ion-modal ion-item {
    --background: transparent;
    box-shadow: none;
    border-bottom: 1px solid var(--ion-color-light);
    border-radius: 0;
    margin-bottom: 0;
}

.modal-content {
    padding: 12px;
}

ion-modal ion-button {
    --border-radius: 8px;
    height: 48px;
    font-weight: 600;
}
</style>
