// ============================================================
// Enums
// ============================================================

export enum ContractStatus {
  Active = 'active',
  Completed = 'completed',
  Overdue = 'overdue',
}

export enum OfferStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Expired = 'expired',
}

export enum TermType {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export enum InterestMode {
  Simple = 'simple',
  Compound = 'compound',
}

export type UserRole = 'financier' | 'borrower';

// ============================================================
// Domain Models (API responses)
// ============================================================

export interface Borrower {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: number;
  borrowerId: number;
  borrowerFullName: string;
  principalAmount: number;
  interestRate: number;
  interestMode: InterestMode;
  termType: TermType;
  termCount: number;
  liquidationRate: number;
  totalAmount: number;
  remainingBalance: number;
  amountPerTerm: number;
  startDate: string;
  dueDate: string;
  status: ContractStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  contractId: number;
  borrowerFullName: string;
  amount: number;
  paymentDate: string;
  receiptNumber: string;
  notes: string;
  createdAt: string;
}

export interface Offer {
  id: number;
  borrowerId: number;
  borrowerFullName: string;
  offeredAmount: number;
  interestRate: number;
  termMonths: number;
  offerDate: string;
  expiryDate: string;
  status: OfferStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Request DTOs
// ============================================================

export interface CreateBorrowerRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
  email?: string;
  phone: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UpdateBorrowerRequest extends Partial<CreateBorrowerRequest> {}

export interface CreateContractRequest {
  borrowerId: number;
  principalAmount: number;
  interestRate: number;
  interestMode: InterestMode;
  termType: TermType;
  termCount: number;
  liquidationRate?: number;
  startDate: string;
  notes?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  status?: ContractStatus;
}

export interface CreatePaymentRequest {
  contractId: number;
  amount: number;
  paymentDate: string;
  receiptNumber?: string;
  notes?: string;
}

export interface CreateOfferRequest {
  borrowerId: number;
  offeredAmount: number;
  interestRate: number;
  termMonths: number;
  expiryDate: string;
  notes?: string;
}

export interface UpdateOfferRequest {
  status?: OfferStatus;
  notes?: string;
}

// ============================================================
// API Response Wrappers
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

// ============================================================
// Dashboard / Summary
// ============================================================

export interface DashboardSummary {
  totalBorrowers: number;
  totalContracts: number;
  totalLentAmount: number;
  totalOutstandingBalance: number;
  totalPaymentsReceived: number;
  activeContracts: number;
  overdueContracts: number;
}

// ============================================================
// App State
// ============================================================

export interface CurrentUser {
  role: UserRole;
  borrowerId?: number;
}
