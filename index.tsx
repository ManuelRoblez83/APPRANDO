import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: '',
            style: {
              borderRadius: '1.5rem',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              className: 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-emerald-200 dark:border-emerald-800 shadow-lg',
              style: {
                borderLeft: '4px solid #10b981',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              className: 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-red-200 dark:border-red-800 shadow-lg',
              style: {
                borderLeft: '4px solid #ef4444',
              },
            },
          }}
        />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);