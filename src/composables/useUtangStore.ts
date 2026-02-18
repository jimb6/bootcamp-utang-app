import { ref, computed } from 'vue';
import type {
  Borrower,
  Contract,
  Payment,
  Offer,
  CurrentUser,
  UserRole,
  CreateBorrowerRequest,
  UpdateBorrowerRequest,
  CreateContractRequest,
  UpdateContractRequest,
  CreatePaymentRequest,
  CreateOfferRequest,
  UpdateOfferRequest,
  ApiError,
} from '@/types';
import { borrowerService, contractService, paymentService, offerService } from '@/services';

// ── Reactive State (singleton across the app) ─────────────────
const currentUser = ref<CurrentUser | null>(null);
const borrowers = ref<Borrower[]>([]);
const contracts = ref<Contract[]>([]);
const payments = ref<Payment[]>([]);
const offers = ref<Offer[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const initialized = ref(false);

const CURRENT_USER_KEY = 'utang_current_user';

// ── Helpers ───────────────────────────────────────────────────
function handleError(err: unknown): string {
  const apiErr = err as ApiError;
  const msg = apiErr?.message || 'An unexpected error occurred';
  error.value = msg;
  console.error('[UtangStore]', msg, err);
  return msg;
}

// ── Composable ────────────────────────────────────────────────
export function useUtangStore() {
  // ── Init ──────────────────────────────────────────────────
  const initialize = async () => {
    if (initialized.value) return;

    // Restore persisted user
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) currentUser.value = JSON.parse(stored);
    } catch { /* ignore corrupt storage */ }

    await fetchAll();
    initialized.value = true;
  };

  const fetchAll = async () => {
    loading.value = true;
    error.value = null;
    try {
      const [b, c, p, o] = await Promise.all([
        borrowerService.getAll(),
        contractService.getAll(),
        paymentService.getAll(),
        offerService.getAll(),
      ]);
      borrowers.value = b;
      contracts.value = c;
      payments.value = p;
      offers.value = o;
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };

  // ── User Management ───────────────────────────────────────
  const setCurrentUser = (role: UserRole, borrowerId?: number) => {
    currentUser.value = { role, borrowerId };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser.value));
  };

  const clearCurrentUser = () => {
    currentUser.value = null;
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  // ── Borrower Fetch ────────────────────────────────────────
  const fetchBorrowers = async () => {
    loading.value = true;
    error.value = null;
    try {
      borrowers.value = await borrowerService.getAll();
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };

  // ── Borrower CRUD ─────────────────────────────────────────
  const addBorrower = async (data: CreateBorrowerRequest): Promise<Borrower> => {
    loading.value = true;
    try {
      const created = await borrowerService.create(data);
      borrowers.value.push(created);
      return created;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  const updateBorrower = async (id: number, data: UpdateBorrowerRequest): Promise<void> => {
    loading.value = true;
    try {
      const updated = await borrowerService.update(id, data);
      const idx = borrowers.value.findIndex((b) => b.id === id);
      if (idx !== -1) borrowers.value[idx] = updated;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  const deleteBorrower = async (id: number): Promise<void> => {
    loading.value = true;
    try {
      await borrowerService.delete(id);
      borrowers.value = borrowers.value.filter((b) => b.id !== id);
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  // ── Contract Fetch ────────────────────────────────────────
  const fetchContracts = async () => {
    loading.value = true;
    error.value = null;
    try {
      contracts.value = await contractService.getAll();
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };

  // ── Contract CRUD ─────────────────────────────────────────
  const addContract = async (data: CreateContractRequest): Promise<Contract> => {
    loading.value = true;
    try {
      const created = await contractService.create(data);
      contracts.value.push(created);
      return created;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  const updateContract = async (id: number, data: UpdateContractRequest): Promise<void> => {
    loading.value = true;
    try {
      const updated = await contractService.update(id, data);
      const idx = contracts.value.findIndex((c) => c.id === id);
      if (idx !== -1) contracts.value[idx] = updated;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  const deleteContract = async (id: number): Promise<void> => {
    loading.value = true;
    try {
      await contractService.delete(id);
      contracts.value = contracts.value.filter((c) => c.id !== id);
      payments.value = payments.value.filter((p) => p.contractId !== id);
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  // ── Payment CRUD ──────────────────────────────────────────
  const addPayment = async (data: CreatePaymentRequest): Promise<Payment> => {
    loading.value = true;
    try {
      const created = await paymentService.create(data);
      payments.value.push(created);
      // Refresh contracts to get updated balance from the API
      const updatedContracts = await contractService.getAll();
      contracts.value = updatedContracts;
      return created;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  const deletePayment = async (id: number): Promise<void> => {
    loading.value = true;
    try {
      await paymentService.delete(id);
      payments.value = payments.value.filter((p) => p.id !== id);
      // Refresh contracts to get updated balance from the API
      const updatedContracts = await contractService.getAll();
      contracts.value = updatedContracts;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  // ── Offer CRUD ────────────────────────────────────────────
  const addOffer = async (data: CreateOfferRequest): Promise<Offer> => {
    loading.value = true;
    try {
      const created = await offerService.create(data);
      offers.value.push(created);
      return created;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  const updateOffer = async (id: number, data: UpdateOfferRequest): Promise<void> => {
    loading.value = true;
    try {
      const updated = await offerService.update(id, data);
      const idx = offers.value.findIndex((o) => o.id === id);
      if (idx !== -1) offers.value[idx] = updated;
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  const deleteOffer = async (id: number): Promise<void> => {
    loading.value = true;
    try {
      await offerService.delete(id);
      offers.value = offers.value.filter((o) => o.id !== id);
    } catch (err) {
      throw new Error(handleError(err));
    } finally {
      loading.value = false;
    }
  };

  // ── Computed Getters ──────────────────────────────────────
  const getContractsByBorrower = (borrowerId: number) =>
    computed(() => contracts.value.filter((c) => c.borrowerId === borrowerId));

  const getPaymentsByContract = (contractId: number) =>
    computed(() => payments.value.filter((p) => p.contractId === contractId));

  const getOffersByBorrower = (borrowerId: number) =>
    computed(() => offers.value.filter((o) => o.borrowerId === borrowerId));

  const totalLentAmount = computed(() =>
    contracts.value.reduce((sum, c) => sum + c.principalAmount, 0),
  );

  const totalOutstanding = computed(() =>
    contracts.value.reduce((sum, c) => sum + c.remainingBalance, 0),
  );

  const activeContracts = computed(() =>
    contracts.value.filter((c) => c.status === 'active'),
  );

  return {
    // State (readonly computed refs)
    currentUser: computed(() => currentUser.value),
    borrowers: computed(() => borrowers.value),
    contracts: computed(() => contracts.value),
    payments: computed(() => payments.value),
    offers: computed(() => offers.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Lifecycle
    initialize,
    fetchAll,

    // User
    setCurrentUser,
    clearCurrentUser,

    // Borrower
    fetchBorrowers,
    addBorrower,
    updateBorrower,
    deleteBorrower,

    // Contract
    fetchContracts,
    addContract,
    updateContract,
    deleteContract,

    // Payment
    addPayment,
    deletePayment,

    // Offer
    addOffer,
    updateOffer,
    deleteOffer,

    // Computed
    getContractsByBorrower,
    getPaymentsByContract,
    getOffersByBorrower,
    totalLentAmount,
    totalOutstanding,
    activeContracts,
  };
}
