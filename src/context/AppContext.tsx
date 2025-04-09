import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppState } from '../types';

const initialState: AppState = {
  currentUser: null,
  users: [],
  savingsRequests: [],
  loanRequests: [],
  loanRepayments: [],
  darkMode: false,
};

type Action =
  | { type: 'SET_CURRENT_USER'; payload: AppState['currentUser'] }
  | { type: 'SET_USERS'; payload: AppState['users'] }
  | { type: 'ADD_SAVINGS_REQUEST'; payload: AppState['savingsRequests'][0] }
  | { type: 'UPDATE_SAVINGS_REQUEST'; payload: AppState['savingsRequests'][0] }
  | { type: 'ADD_LOAN_REQUEST'; payload: AppState['loanRequests'][0] }
  | { type: 'UPDATE_LOAN_REQUEST'; payload: AppState['loanRequests'][0] }
  | { type: 'ADD_LOAN_REPAYMENT'; payload: AppState['loanRepayments'][0] }
  | { type: 'TOGGLE_DARK_MODE' };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case 'SET_CURRENT_USER':
      newState = { ...state, currentUser: action.payload };
      break;
    case 'SET_USERS':
      newState = { ...state, users: action.payload };
      break;
    case 'ADD_SAVINGS_REQUEST':
      newState = {
        ...state,
        savingsRequests: [...state.savingsRequests, action.payload],
      };
      break;
    case 'UPDATE_SAVINGS_REQUEST':
      newState = {
        ...state,
        savingsRequests: state.savingsRequests.map((req) =>
          req.id === action.payload.id ? action.payload : req
        ),
      };
      break;
    case 'ADD_LOAN_REQUEST':
      newState = {
        ...state,
        loanRequests: [...state.loanRequests, action.payload],
      };
      break;
    case 'UPDATE_LOAN_REQUEST':
      newState = {
        ...state,
        loanRequests: state.loanRequests.map((req) =>
          req.id === action.payload.id ? action.payload : req
        ),
      };
      break;
    case 'ADD_LOAN_REPAYMENT':
      newState = {
        ...state,
        loanRepayments: [...state.loanRepayments, action.payload],
      };
      break;
    case 'TOGGLE_DARK_MODE':
      newState = {
        ...state,
        darkMode: !state.darkMode,
      };
      break;
    default:
      return state;
  }

  // Save to localStorage after every action
  localStorage.setItem('appState', JSON.stringify(newState));
  return newState;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.darkMode) {
        document.documentElement.classList.add('dark');
      }
      return parsedState;
    }
    return initialState;
  });

  useEffect(() => {
    // Update dark mode class on html element
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}