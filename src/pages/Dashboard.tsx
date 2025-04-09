import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Users,
  PiggyBank,
  Wallet,
} from 'lucide-react';

function Dashboard() {
  const { state } = useApp();

  // Calculate total savings
  const totalSavings = state.savingsRequests
    .filter((req) => req.status === 'approved')
    .reduce((sum, req) => sum + req.amount, 0);

  // Calculate total loans
  const totalLoans = state.loanRequests
    .filter((req) => req.status === 'approved')
    .reduce((sum, req) => sum + req.amount, 0);

  // Calculate total repayments
  const totalRepayments = state.loanRepayments
    .reduce((sum, rep) => sum + rep.amount, 0);

  // Calculate user's personal stats
  const userSavings = state.savingsRequests
    .filter((req) => req.userId === state.currentUser?.id && req.status === 'approved')
    .reduce((sum, req) => sum + req.amount, 0);

  const userLoans = state.loanRequests
    .filter((req) => req.userId === state.currentUser?.id && req.status === 'approved')
    .map(loan => {
      const totalRepaid = state.loanRepayments
        .filter(rep => rep.loanId === loan.id)
        .reduce((sum, rep) => sum + rep.amount, 0);
      
      const totalDue = loan.amount * (1 + (loan.interestRate / 100) * loan.repaymentPeriod);
      return { ...loan, totalRepaid, totalDue };
    });

  const userTotalLoans = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const userTotalRepaid = userLoans.reduce((sum, loan) => sum + loan.totalRepaid, 0);
  const userTotalDue = userLoans.reduce((sum, loan) => sum + loan.totalDue, 0);

  const stats = [
    {
      title: 'Total Savings',
      value: `${totalSavings.toLocaleString()} UGX`,
      icon: PiggyBank,
      color: 'bg-green-500',
    },
    {
      title: 'Active Loans',
      value: `${totalLoans.toLocaleString()} UGX`,
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Repayments',
      value: `${totalRepayments.toLocaleString()} UGX`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Members',
      value: state.users.length,
      icon: Users,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your savings group
        </p>
      </div>

      {/* Personal Stats */}
      {state.currentUser?.role === 'member' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">Your Total Savings</p>
              <p className="mt-2 text-xl font-bold text-green-900">
                {userSavings.toLocaleString()} UGX
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Your Total Loans</p>
              <p className="mt-2 text-xl font-bold text-blue-900">
                {userTotalLoans.toLocaleString()} UGX
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Total Repaid</p>
              <p className="mt-2 text-xl font-bold text-purple-900">
                {userTotalRepaid.toLocaleString()} UGX
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-800">Remaining Balance</p>
              <p className="mt-2 text-xl font-bold text-red-900">
                {(userTotalDue - userTotalRepaid).toLocaleString()} UGX
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Savings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Savings
          </h2>
          <div className="space-y-4">
            {state.savingsRequests
              .filter((req) => req.status === 'approved')
              .slice(0, 5)
              .map((saving) => (
                <div
                  key={saving.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {state.users.find((u) => u.id === saving.userId)?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(saving.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    +{saving.amount.toLocaleString()} UGX
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Loans */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Loans
          </h2>
          <div className="space-y-4">
            {state.loanRequests
              .filter((req) => req.status === 'approved')
              .slice(0, 5)
              .map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {state.users.find((u) => u.id === loan.userId)?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(loan.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-blue-600">
                    {loan.amount.toLocaleString()} UGX
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;