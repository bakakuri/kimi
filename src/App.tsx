import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/pages/Dashboard';
import { Learn } from '@/pages/Learn';
import { Tests } from '@/pages/Tests';
import { Sentences } from '@/pages/Sentences';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { useAuth } from '@/hooks/useAuth';
import { getThemeById } from '@/data/themes';
import { Toaster } from '@/components/ui/sonner';

type Page = 'dashboard' | 'learn' | 'tests' | 'sentences' | 'profile' | 'settings';
type AuthView = 'login' | 'register';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');
  const { isAuthenticated, isLoading, currentUser, logout } = useAuth();

  const theme = currentUser ? getThemeById(currentUser.theme) : getThemeById('default');

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--surface', theme.colors.surface);
    root.style.setProperty('--text', theme.colors.text);
    root.style.setProperty('--text-muted', theme.colors.textMuted);
    root.style.setProperty('--success', theme.colors.success);
    root.style.setProperty('--error', theme.colors.error);
    root.style.setProperty('--warning', theme.colors.warning);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" 
          style={{ borderColor: theme.colors.primary, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ background: theme.colors.background }}>
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
        <Toaster />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'learn':
        return <Learn />;
      case 'tests':
        return <Tests />;
      case 'sentences':
        return <Sentences />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: theme.colors.background }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={logout} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {renderPage()}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
