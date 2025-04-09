import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

function Loans() {
  const { state, dispatch } = useApp();
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState('1');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const loanRequest = {
      id: uuidv4(),
      userId: state.currentUser!.id,
      amount: parseFloat(amount),
      purpose,
      date: new Date().toISOString(),
      status: 'pending',
      repaymentPeriod: parseInt(repaymentPeriod),
      interestRate: 5, // 5% per month
    };

    dispatch({ type: 'ADD_LOAN_REQUEST', payload: loanRequest });
    setAmount('');
    setPurpose('');
    setRepaymentPeriod('1');
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;

    const repayment = {
      id: uuidv4(),
      loanId: selectedLoanId,
      amount: parseFloat(repaymentAmount),
      date: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_LOAN_REPAYMENT', payload: repayment });
    setRepaymentAmount('');
    setSelectedLoanId(null);
  };

  const handleApprove = (id: string) => {
    const request = state.loanRequests.find((req) => req.id === id);
    if (request) {
      dispatch({
        type: 'UPDATE_LOAN_REQUEST',
        payload: { ...request, status: 'approved' },
      });
    }
  };

  const handleReject = (id: string) => {
    const request = state.loanRequests.find((req) => req.id === id);
    if (request) {
      dispatch({
        type: 'UPDATE_LOAN_REQUEST',
        payload: { ...request, status: 'rejected' },
      });
    }
  };

  const calculateTotalRepayment = (amount: number, months: number) => {
    const monthlyInterest = 0.05; // 5%
    return amount * (1 + monthlyInterest * months);
  };

  const userLoans = state.loanRequests.filter(
    (req) => req.userId === state.currentUser?.id
  );

  const pendingLoans = state.loanRequests.filter(
    (req) => req.status === 'pending'
  );

  const approvedLoans = state.loanRequests.filter(
    (req) => req.status === 'approved'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
        <p className="mt-1 text-sm text-gray-500">
          Request and manage your loans
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Loan Request Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            New Loan Request
          </h2>
          <form onSubmit={handleLoanSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (UGX)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input mt-1"
                required
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Purpose
              </label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="input mt-1"
                required
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                Repayment Period (months)
              </label>
              <select
                id="period"
                value={repaymentPeriod}
                onChange={(e) => setRepaymentPeriod(e.target.value)}
                className="input mt-1"
                required
              >
                {[1, 2, 3, 4, 5, 6, 12].map((months) => (
                  <option key={months} value={months}>
                    {months} month{months > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            {amount && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Total repayment amount (including 5% monthly interest):
                  <br />
                  <span className="font-semibold">
                    {calculateTotalRepayment(
                      parseFloat(amount),
                      parseInt(repaymentPeriod)
                    ).toLocaleString()}{' '}
                    UGX
                  </span>
                </p>
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full">
              Submit Request
            </button>
          </form>
        </div>

        {/* Loan Repayment Form */}
        {approvedLoans.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Loan Repayment
            </h2>
            <form onSubmit={handleRepaymentSubmit} className="space-y-4">
              <div>
                <label htmlFor="loan" className="block text-sm font-medium text-gray-700">
                  Select Loan
                </label>
                <select
                  id="loan"
                  value={selectedLoanId || ''}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="input mt-1"
                  required
                >
                  <option value="">Select a loan</option>
                  {approvedLoans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.amount.toLocaleString()} UGX - {loan.purpose}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="repayment" className="block text-sm font-medium text-gray-700">
                  Repayment Amount (UGX)
                </label>
                <input
                  type="number"
                  id="repayment"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  className="input mt-1"
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Submit Repayment
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Loan History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Loan History
        </h2>
        <div className="space-y-4">
          {userLoans.map((loan) => {
            const loanRepayments = state.loanRepayments.filter(
              (rep) => rep.loanId === loan.id
            );
            const totalRepaid = loanRepayments.reduce(
              (sum, rep) => sum + rep.amount,
              0
            );
            const totalDue = calculateTotalRepayment(
              loan.amount,
              loan.repaymentPeriod
            );

            return (
              <div
                key={loan.id}
                className="p-4 bg-gray-50 rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {loan.amount.toLocaleString()} UGX
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(loan.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {loan.purpose}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      loan.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : loan.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
                {loan.status === 'approved' && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Total Due: {totalDue.toLocaleString()} UGX
                    </p>
                    <p className="text-sm text-gray-600">
                      Repaid: {totalRepaid.toLocaleString()} UGX
                    </p>
                    <p className="text-sm text-gray-600">
                      Remaining:{' '}
                      {(totalDue - totalRepaid).toLocaleString()} UGX
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Section - Pending Requests */}
      {state.currentUser?.role === 'admin' && pendingLoans.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Loan Requests
          </h2>
          <div className="space-y-4">
            {pendingLoans.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {state.users.find((u) => u.id === request.userId)?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.amount.toLocaleString()} UGX
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {request.purpose}
                  </p>
                  <p className="text-sm text-blue-600">
                    Total repayment:{' '}
                    {calculateTotalRepayment(
                      request.amount,
                      request.repaymentPeriod
                    ).toLocaleString()}{' '}
                    UGX
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="btn btn-primary"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="btn btn-secondary"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Loans;