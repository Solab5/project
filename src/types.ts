export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface SavingsRequest {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  repaymentPeriod: number; // in months
  interestRate: number;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  savingsRequests: SavingsRequest[];
  loanRequests: LoanRequest[];
  loanRepayments: LoanRepayment[];
  darkMode: boolean;
}