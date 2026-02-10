import { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CustomerDashboard from './components/CustomerDashboard';
import AuditorDashboard from './components/AuditorDashboard';
import { User } from '@/types/loan';

type Page = 'login' | 'register';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('login');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
  };

  if (!currentUser) {
    if (page === 'register') {
      return <RegisterPage onBack={() => setPage('login')} />;
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setPage('register')}
      />
    );
  }

  if (currentUser.role === 'customer') {
    return <CustomerDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <AuditorDashboard user={currentUser} onLogout={handleLogout} />;
}

export default App;
