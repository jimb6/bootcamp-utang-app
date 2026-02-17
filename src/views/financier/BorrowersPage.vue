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
                            <ion-icon :icon="peopleOutline" color="teriary"></ion-icon>
                            <div>
                                <h3>{{ store.borrowers.value.length }}</h3>
                                <p>Numero sa mga Pala-Utang</p>
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
            <ion-list v-if="store.borrowers.value.length > 0" lines="none">
                <ion-item v-for="borrower in store.borrowers.value" :key="borrower.id">
                    <ion-icon :icon="personCircleOutline" slot="start" color="primary"></ion-icon>
                    <ion-label>
                        <h2>{{ borrower.name || `${borrower.firstName} ${borrower.lastName}` }}</h2>
                        <p>{{ borrower.phone }}</p>
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
            <ion-modal :is-open="showAddModal" @did-dismiss="closeModal" class="borrower-modal">
                <ion-header>
                    <ion-toolbar color="primary">
                        <ion-title>{{ editingBorrower ? 'I-edit' : 'Bag-o' }} Pala-Utang</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeModal">
                                <ion-icon :icon="closeOutline"></ion-icon>
                            </ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content>
                    <div class="modal-content">
                        <!-- Personal Information -->
                        <div class="section-header">
                            <ion-icon :icon="personOutline"></ion-icon>
                            <h3>Personal Information</h3>
                        </div>
                        
                        <div class="form-row">
                            <ion-item class="form-item half">
                                <ion-input 
                                    v-model="formData.firstName" 
                                    label="First Name" 
                                    label-placement="floating"
                                    placeholder="Juan"
                                ></ion-input>
                            </ion-item>
                            <ion-item class="form-item half">
                                <ion-input 
                                    v-model="formData.lastName" 
                                    label="Last Name" 
                                    label-placement="floating"
                                    placeholder="Dela Cruz"
                                ></ion-input>
                            </ion-item>
                        </div>

                        <ion-item class="form-item">
                            <ion-input 
                                v-model="formData.birthDate" 
                                label="Birth Date" 
                                label-placement="floating"
                                type="date"
                            ></ion-input>
                        </ion-item>

                        <!-- Contact Information -->
                        <div class="section-header">
                            <ion-icon :icon="callOutline"></ion-icon>
                            <h3>Contact Information</h3>
                        </div>

                        <ion-item class="form-item">
                            <ion-input 
                                v-model="formData.phone" 
                                label="Contact Number" 
                                label-placement="floating" 
                                type="tel"
                                placeholder="09xx-xxx-xxxx"
                            ></ion-input>
                        </ion-item>

                        <ion-item class="form-item">
                            <ion-input 
                                v-model="formData.email" 
                                label="Email (Optional)" 
                                label-placement="floating" 
                                type="email"
                                placeholder="email@example.com"
                            ></ion-input>
                        </ion-item>

                        <ion-item class="form-item">
                            <ion-textarea 
                                v-model="formData.address" 
                                label="Address" 
                                label-placement="floating" 
                                :rows="2"
                                placeholder="Complete address"
                            ></ion-textarea>
                        </ion-item>

                        <!-- Emergency Contact -->
                        <div class="section-header">
                            <ion-icon :icon="alertCircleOutline"></ion-icon>
                            <h3>Emergency Contact</h3>
                        </div>

                        <ion-item class="form-item">
                            <ion-input 
                                v-model="formData.emergencyContactName" 
                                label="Full Name" 
                                label-placement="floating"
                                placeholder="Emergency contact name"
                            ></ion-input>
                        </ion-item>

                        <ion-item class="form-item">
                            <ion-input 
                                v-model="formData.emergencyContactPhone" 
                                label="Contact Number" 
                                label-placement="floating" 
                                type="tel"
                                placeholder="09xx-xxx-xxxx"
                            ></ion-input>
                        </ion-item>

                        <ion-button expand="block" color="primary" @click="saveBorrower" class="save-button">
                            <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
                            {{ editingBorrower ? 'I-update' : 'I-save' }}
                        </ion-button>
                    </div>
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
    closeOutline,
    checkmarkOutline,
    callOutline,
    alertCircleOutline,
    personOutline,
} from 'ionicons/icons';
import { useUtangStore } from '@/composables/useUtangStore';
import { Borrower } from '@/types';

const router = useRouter();
const store = useUtangStore();
const showAddModal = ref(false);
const editingBorrower = ref<Borrower | null>(null);

const formData = ref({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
});

const resetForm = () => {
    formData.value = {
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        phone: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
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
        firstName: borrower.firstName || '',
        lastName: borrower.lastName || '',
        birthDate: borrower.birthDate || '',
        email: borrower.email || '',
        phone: borrower.phone || '',
        address: borrower.address || '',
        emergencyContactName: borrower.emergencyContactName || '',
        emergencyContactPhone: borrower.emergencyContactPhone || '',
    };
    showAddModal.value = true;
};

const saveBorrower = () => {
    if (!formData.value.firstName || !formData.value.lastName || !formData.value.phone) {
        alert('Please fill in required fields (First Name, Last Name, Contact Number)');
        return;
    }

    const borrowerData = {
        ...formData.value,
        name: `${formData.value.firstName} ${formData.value.lastName}`.trim(),
    };

    if (editingBorrower.value) {
        store.updateBorrower(editingBorrower.value.id, borrowerData);
    } else {
        store.addBorrower(borrowerData);
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
    padding: 8px;
}

ion-modal ion-button {
    --border-radius: 8px;
    height: 48px;
    font-weight: 600;
}
.borrower-modal {
    --border-radius: 8px 8px 0 0;
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

.form-row {
    display: flex;
    gap: 8px;
    margin-bottom: 0;
}

.form-item {
    --background: white;
    --border-radius: 8px;
    --padding-start: 12px;
    --padding-end: 12px;
    --padding-bottom: 8px;
    --min-height: 44px;
    --color: var(--ion-color-dark);
    --placeholder-color: var(--ion-color-medium-shade);
    --placeholder-opacity: 0.8;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    font-size: 14px;
}

.form-item.half {
    flex: 1;
    margin-bottom: 8px;
}

.form-item ion-input,
.form-item ion-textarea {
    --padding-top: 4px;
    --padding-bottom: 4px;
    --color: var(--ion-color-dark);
    --placeholder-color: var(--ion-color-medium-shade);
    --placeholder-opacity: 0.8;
    font-size: 14px;
}

.form-item ion-label {
    font-size: 10px;
    color: var(--ion-color-dark);
    font-weight: 600;
}

.save-button {
    margin-top: 16px;
    height: 44px;
    font-weight: 700;
    font-size: 15px;
    --border-radius: 12px;
    --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
}</style>
