export interface Borrower {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Full name for backward compatibility
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: Date;
}

export interface UtangContract {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  dueDate: Date;
  status: 'active' | 'completed' | 'overdue';
  totalAmount: number;
  remainingBalance: number;
  notes: string;
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate: Date;
  notes: string;
  receiptNumber: string;
}

export interface UtangOffer {
  id: string;
  borrowerId: string;
  borrowerName: string;
  offeredAmount: number;
  interestRate: number;
  termMonths: number;
  offerDate: Date;
  expiryDate: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  notes: string;
}

export type UserRole = 'financier' | 'borrower';
