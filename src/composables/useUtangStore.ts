import { ref, computed } from 'vue';
import { Borrower, UtangContract, Payment, UtangOffer, UserRole } from '@/types';

// Storage keys
const BORROWERS_KEY = 'utang_borrowers';
const CONTRACTS_KEY = 'utang_contracts';
const PAYMENTS_KEY = 'utang_payments';
const OFFERS_KEY = 'utang_offers';
const CURRENT_USER_KEY = 'utang_current_user';

// Current user state
const currentUser = ref<{ role: UserRole; borrowerId?: string } | null>(null);

// Data stores
const borrowers = ref<Borrower[]>([]);
const contracts = ref<UtangContract[]>([]);
const payments = ref<Payment[]>([]);
const offers = ref<UtangOffer[]>([]);

// Load data from localStorage
const loadData = () => {
  try {
    const storedBorrowers = localStorage.getItem(BORROWERS_KEY);
    if (storedBorrowers) borrowers.value = JSON.parse(storedBorrowers);

    const storedContracts = localStorage.getItem(CONTRACTS_KEY);
    if (storedContracts) {
      contracts.value = JSON.parse(storedContracts).map((c: any) => ({
        ...c,
        startDate: new Date(c.startDate),
        dueDate: new Date(c.dueDate),
      }));
    }

    const storedPayments = localStorage.getItem(PAYMENTS_KEY);
    if (storedPayments) {
      payments.value = JSON.parse(storedPayments).map((p: any) => ({
        ...p,
        paymentDate: new Date(p.paymentDate),
      }));
    }

    const storedOffers = localStorage.getItem(OFFERS_KEY);
    if (storedOffers) {
      offers.value = JSON.parse(storedOffers).map((o: any) => ({
        ...o,
        offerDate: new Date(o.offerDate),
        expiryDate: new Date(o.expiryDate),
      }));
    }

    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) currentUser.value = JSON.parse(storedUser);
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

// Save data to localStorage
const saveData = () => {
  localStorage.setItem(BORROWERS_KEY, JSON.stringify(borrowers.value));
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts.value));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments.value));
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers.value));
};

export const useUtangStore = () => {
  // Initialize data
  if (borrowers.value.length === 0) {
    loadData();
  }

  // User management
  const setCurrentUser = (role: UserRole, borrowerId?: string) => {
    currentUser.value = { role, borrowerId };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser.value));
  };

  const clearCurrentUser = () => {
    currentUser.value = null;
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  // Borrower operations
  const addBorrower = (borrower: Omit<Borrower, 'id' | 'createdAt'>) => {
    const newBorrower: Borrower = {
      ...borrower,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    borrowers.value.push(newBorrower);
    saveData();
    return newBorrower;
  };

  const updateBorrower = (id: string, updates: Partial<Borrower>) => {
    const index = borrowers.value.findIndex(b => b.id === id);
    if (index !== -1) {
      borrowers.value[index] = { ...borrowers.value[index], ...updates };
      saveData();
    }
  };

  const deleteBorrower = (id: string) => {
    borrowers.value = borrowers.value.filter(b => b.id !== id);
    saveData();
  };

  // Contract operations
  const addContract = (contract: Omit<UtangContract, 'id' | 'remainingBalance'>) => {
    const newContract: UtangContract = {
      ...contract,
      id: Date.now().toString(),
      remainingBalance: contract.totalAmount,
    };
    contracts.value.push(newContract);
    saveData();
    return newContract;
  };

  const updateContract = (id: string, updates: Partial<UtangContract>) => {
    const index = contracts.value.findIndex(c => c.id === id);
    if (index !== -1) {
      contracts.value[index] = { ...contracts.value[index], ...updates };
      saveData();
    }
  };

  const deleteContract = (id: string) => {
    contracts.value = contracts.value.filter(c => c.id !== id);
    payments.value = payments.value.filter(p => p.contractId !== id);
    saveData();
  };

  // Payment operations
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
    };
    payments.value.push(newPayment);

    // Update contract balance
    const contract = contracts.value.find(c => c.id === payment.contractId);
    if (contract) {
      contract.remainingBalance -= payment.amount;
      if (contract.remainingBalance <= 0) {
        contract.status = 'completed';
        contract.remainingBalance = 0;
      }
    }

    saveData();
    return newPayment;
  };

  const deletePayment = (id: string) => {
    const payment = payments.value.find(p => p.id === id);
    if (payment) {
      const contract = contracts.value.find(c => c.id === payment.contractId);
      if (contract) {
        contract.remainingBalance += payment.amount;
        if (contract.remainingBalance > 0 && contract.status === 'completed') {
          contract.status = 'active';
        }
      }
      payments.value = payments.value.filter(p => p.id !== id);
      saveData();
    }
  };

  // Offer operations
  const addOffer = (offer: Omit<UtangOffer, 'id'>) => {
    const newOffer: UtangOffer = {
      ...offer,
      id: Date.now().toString(),
    };
    offers.value.push(newOffer);
    saveData();
    return newOffer;
  };

  const updateOffer = (id: string, updates: Partial<UtangOffer>) => {
    const index = offers.value.findIndex(o => o.id === id);
    if (index !== -1) {
      offers.value[index] = { ...offers.value[index], ...updates };
      saveData();
    }
  };

  const deleteOffer = (id: string) => {
    offers.value = offers.value.filter(o => o.id !== id);
    saveData();
  };

  // Computed values
  const getContractsByBorrower = (borrowerId: string) => {
    return computed(() => contracts.value.filter(c => c.borrowerId === borrowerId));
  };

  const getPaymentsByContract = (contractId: string) => {
    return computed(() => payments.value.filter(p => p.contractId === contractId));
  };

  const getOffersByBorrower = (borrowerId: string) => {
    return computed(() => offers.value.filter(o => o.borrowerId === borrowerId));
  };

  const totalLentAmount = computed(() => {
    return contracts.value.reduce((sum, c) => sum + c.principalAmount, 0);
  });

  const totalOutstanding = computed(() => {
    return contracts.value.reduce((sum, c) => sum + c.remainingBalance, 0);
  });

  return {
    // State
    currentUser: computed(() => currentUser.value),
    borrowers: computed(() => borrowers.value),
    contracts: computed(() => contracts.value),
    payments: computed(() => payments.value),
    offers: computed(() => offers.value),

    // User management
    setCurrentUser,
    clearCurrentUser,

    // Operations
    addBorrower,
    updateBorrower,
    deleteBorrower,
    addContract,
    updateContract,
    deleteContract,
    addPayment,
    deletePayment,
    addOffer,
    updateOffer,
    deleteOffer,

    // Computed
    getContractsByBorrower,
    getPaymentsByContract,
    getOffersByBorrower,
    totalLentAmount,
    totalOutstanding,
  };
};
