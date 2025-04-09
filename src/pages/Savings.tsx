import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

function Savings() {
  const { state, dispatch } = useApp();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savingsRequest = {
      id: uuidv4(),
      userId: state.currentUser!.id,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      status: 'pending',
      notes,
    };

    dispatch({ type: 'ADD_SAVINGS_REQUEST', payload: savingsRequest });
    setAmount('');
    setNotes('');
  };

  const handleApprove = (id: string) => {
    const request = state.savingsRequests.find((req) => req.id === id);
    if (request) {
      dispatch({
        type: 'UPDATE_SAVINGS_REQUEST',
        payload: { ...request, status: 'approved' },
      });
    }
  };

  const handleReject = (id: string) => {
    const request = state.savingsRequests.find((req) => req.id === id);
    if (request) {
      dispatch({
        type: 'UPDATE_SAVINGS_REQUEST',
        payload: { ...request, status: 'rejected' },
      });
    }
  };

  const userRequests = state.savingsRequests.filter(
    (req) => req.userId === state.currentUser?.id
  );

  const pendingRequests = state.savingsRequests.filter(
    (req) => req.status === 'pending'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Savings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit and manage your savings requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Savings Request Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            New Savings Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input mt-1"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Submit Request
            </button>
          </form>
        </div>

        {/* User's Savings History */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Savings History
          </h2>
          <div className="space-y-4">
            {userRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-gray-50 rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.amount.toLocaleString()} UGX
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                {request.notes && (
                  <p className="text-sm text-gray-600">{request.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Section - Pending Requests */}
      {state.currentUser?.role === 'admin' && pendingRequests.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Requests
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
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
                  {request.notes && (
                    <p className="text-sm text-gray-600 mt-1">{request.notes}</p>
                  )}
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

export default Savings;