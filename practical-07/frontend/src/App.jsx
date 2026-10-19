import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import { getToken, removeToken, getMe } from './api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  // Check if token exists on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Auth token verification failed:', err.message);
        removeToken();
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    initAuth();

    // Listen to unauthorized event from API client
    const handleUnauthorized = () => {
      setUser(null);
      setAuthView('login');
      alert('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setAuthView('login');
  };

  if (checkingAuth) {
    return (
      <div className="center-container">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="main-header">
        <h1>Practical 07: Authentication & Middleware Pipeline</h1>
        <p>Nisarg Dedakiya (24CS014) | React + Express + JWT + MongoDB</p>
      </header>

      <main className="content">
        {user ? (
          <TaskList user={user} onLogout={handleLogout} />
        ) : authView === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthView('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </main>
    </div>
  );
}
