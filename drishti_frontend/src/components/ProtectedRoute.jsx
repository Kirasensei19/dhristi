import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        background: '#060913',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00f3ff',
        fontFamily: 'var(--font-mono, monospace)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(0, 243, 255, 0.2)',
            borderTopColor: '#00f3ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: '13px', letterSpacing: '0.1em' }}>INITIALIZING D.R.I.S.H.T.I. COMMAND SESSION...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
}
