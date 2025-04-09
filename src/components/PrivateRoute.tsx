import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;