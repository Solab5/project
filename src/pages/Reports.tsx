import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Reports() {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const getDateRangeStats = () => {
    const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
    const endDate = dateRange.end ? new Date(dateRange.end) : new Date();

    const periodSavings = state.savingsRequests
      .filter(req => {
        const reqDate = new Date(req.date);
        return req.status === 'approved' &&
          reqDate >= startDate &&
          reqDate <= endDate;
      })
      .reduce((sum, req) => sum + req.amount, 0);

    const periodLoans = state.loanRequests
      .filter(req => {
        const reqDate = new Date(req.date);
        return req.status === 'approved' &&
          reqDate >= startDate &&
          reqDate <= endDate;
      })
      .reduce((sum, req) => sum + req.amount, 0);

    const periodRepayments = state.loanRepayments
      .filter(rep => {
        const repDate = new Date(rep.date);
        return repDate >= startDate && repDate <= endDate;
      })
      .reduce((sum, rep) => sum + rep.amount, 0);

    return { periodSavings, periodLoans, periodRepayments };
  };

  const getMemberStats = () => {
    return state.users
      .filter(user => user.role === 'member')
      .map(member => {
        const totalSavings = state.savingsRequests
          .filter(req => req.userId === member.id && req.status === 'approved')
          .reduce((sum, req) => sum + req.amount, 0);

        const activeLoans = state.loanRequests
          .filter(req => req.userId === member.id && req.status === 'approved')
          .map(loan => {
            const totalRepaid = state.loanRepayments
              .filter(rep => rep.loanId === loan.id)
              .reduce((sum, rep) => sum + rep.amount, 0);
            
            const totalDue = loan.amount * (1 + (loan.interestRate / 100) * loan.repaymentPeriod);
            const remaining = totalDue - totalRepaid;

            return {
              ...loan,
              totalRepaid,
              totalDue,
              remaining
            };
          });

        const totalLoans = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
        const totalRepaid = activeLoans.reduce((sum, loan) => sum + loan.totalRepaid, 0);
        const totalRemaining = activeLoans.reduce((sum, loan) => sum + loan.remaining, 0);

        return {
          member,
          totalSavings,
          totalLoans,
          totalRepaid,
          totalRemaining,
          activeLoans
        };
      });
  };

  const getUserTransactions = () => {
    const userId = state.currentUser?.role === 'member' ? state.currentUser.id : null;
    
    const transactions = [
      ...state.savingsRequests
        .filter(req => !userId || req.userId === userId)
        .map(req => ({
          type: 'Savings',
          date: new Date(req.date),
          amount: req.amount,
          status: req.status,
          notes: req.notes,
          user: state.users.find(u => u.id === req.userId)?.name
        })),
      ...state.loanRequests
        .filter(req => !userId || req.userId === userId)
        .map(req => ({
          type: 'Loan Request',
          date: new Date(req.date),
          amount: req.amount,
          status: req.status,
          notes: req.purpose,
          user: state.users.find(u => u.id === req.userId)?.name
        })),
      ...state.loanRepayments
        .filter(rep => {
          const loan = state.loanRequests.find(l => l.id === rep.loanId);
          return !userId || (loan && loan.userId === userId);
        })
        .map(rep => {
          const loan = state.loanRequests.find(l => l.id === rep.loanId);
          return {
            type: 'Loan Repayment',
            date: new Date(rep.date),
            amount: rep.amount,
            status: 'completed',
            notes: `Repayment for loan of ${loan?.amount.toLocaleString()} UGX`,
            user: state.users.find(u => u.id === loan?.userId)?.name
          };
        })
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return transactions;
  };

  const periodStats = getDateRangeStats();
  const memberStats = getMemberStats();
  const transactions = getUserTransactions();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View detailed reports and statistics
        </p>
      </div>

      {/* Period Report */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Period Report</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input max-w-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input max-w-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Savings</p>
            <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-200">
              {periodStats.periodSavings.toLocaleString()} UGX
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Loans</p>
            <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-200">
              {periodStats.periodLoans.toLocaleString()} UGX
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Total Repayments</p>
            <p className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-200">
              {periodStats.periodRepayments.toLocaleString()} UGX
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                {state.currentUser?.role === 'admin' && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Member</th>
                )}
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {transaction.date.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {transaction.type}
                  </td>
                  {state.currentUser?.role === 'admin' && (
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {transaction.user}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    <span className={transaction.type === 'Loan Repayment' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}>
                      {transaction.amount.toLocaleString()} UGX
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : transaction.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        : transaction.status === 'completed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {transaction.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Statistics (Only visible to admins) */}
      {state.currentUser?.role === 'admin' && (
        <div className="space-y-6">
          {memberStats.map(({ member, totalSavings, totalLoans, totalRepaid, totalRemaining, activeLoans }) => (
            <div key={member.id} className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {member.name}'s Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Savings</p>
                  <p className="mt-1 text-xl font-semibold text-green-900 dark:text-green-200">
                    {totalSavings.toLocaleString()} UGX
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Loans</p>
                  <p className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-200">
                    {totalLoans.toLocaleString()} UGX
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Total Repaid</p>
                  <p className="mt-1 text-xl font-semibold text-purple-900 dark:text-purple-200">
                    {totalRepaid.toLocaleString()} UGX
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Outstanding Balance</p>
                  <p className="mt-1 text-xl font-semibold text-red-900 dark:text-red-200">
                    {totalRemaining.toLocaleString()} UGX
                  </p>
                </div>
              </div>

              {activeLoans.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Active Loans</h4>
                  <div className="space-y-2">
                    {activeLoans.map(loan => (
                      <div key={loan.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {loan.amount.toLocaleString()} UGX
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(loan.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Repaid: {loan.totalRepaid.toLocaleString()} UGX
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Remaining: {loan.remaining.toLocaleString()} UGX
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;