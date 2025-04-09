import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

function Members() {
  const { state, dispatch } = useApp();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Only show this page to admins
  if (state.currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    const member = {
      id: uuidv4(),
      name: newMember.name,
      email: newMember.email,
      role: 'member' as const,
      joinedAt: new Date().toISOString(),
    };

    dispatch({ 
      type: 'SET_USERS', 
      payload: [...state.users, member]
    });

    setNewMember({ name: '', email: '', phone: '' });
    setShowAddMember(false);
  };

  const calculateMemberStats = (userId: string) => {
    const savings = state.savingsRequests
      .filter((req) => req.userId === userId && req.status === 'approved')
      .reduce((sum, req) => sum + req.amount, 0);

    const loans = state.loanRequests
      .filter((req) => req.userId === userId && req.status === 'approved')
      .reduce((sum, req) => sum + req.amount, 0);

    const repayments = state.loanRepayments
      .filter((rep) => {
        const loan = state.loanRequests.find((l) => l.id === rep.loanId);
        return loan?.userId === userId;
      })
      .reduce((sum, rep) => sum + rep.amount, 0);

    return { savings, loans, repayments };
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Members</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and view member information
          </p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="btn btn-primary"
        >
          Add New Member
        </button>
      </div>

      {/* Add Member Form Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Add New Member
                </h3>
                <form onSubmit={handleAddMember} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      className="input mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      className="input mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      className="input mt-1"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="btn btn-secondary w-full"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary w-full">
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {state.users
          .filter((user) => user.role === 'member')
          .map((member) => {
            const stats = calculateMemberStats(member.id);

            return (
              <div key={member.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Joined: {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Total Savings
                    </p>
                    <p className="mt-1 text-xl font-semibold text-green-900 dark:text-green-200">
                      {stats.savings.toLocaleString()} UGX
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Total Loans
                    </p>
                    <p className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-200">
                      {stats.loans.toLocaleString()} UGX
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      Total Repayments
                    </p>
                    <p className="mt-1 text-xl font-semibold text-purple-900 dark:text-purple-200">
                      {stats.repayments.toLocaleString()} UGX
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {[
                      ...state.savingsRequests
                        .filter((req) => req.userId === member.id)
                        .map((req) => ({
                          type: 'savings',
                          date: req.date,
                          amount: req.amount,
                          status: req.status,
                        })),
                      ...state.loanRequests
                        .filter((req) => req.userId === member.id)
                        .map((req) => ({
                          type: 'loan',
                          date: req.date,
                          amount: req.amount,
                          status: req.status,
                        })),
                    ]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                activity.type === 'savings'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {activity.type === 'savings'
                                ? 'Savings'
                                : 'Loan'}{' '}
                              - {activity.amount.toLocaleString()} UGX
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              activity.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : activity.status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            }`}
                          >
                            {activity.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Members;