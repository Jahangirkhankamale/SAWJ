import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import LoginForm from './components/Authentication/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';

// Placeholder components for other sections
const PlaceholderComponent: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400">
        This section is under development. The {title.toLowerCase()} functionality will be implemented with full features including:
      </p>
      <ul className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <li>• Advanced user interface with modern design</li>
        <li>• Real-time data synchronization</li>
        <li>• Comprehensive reporting and analytics</li>
        <li>• Mobile-responsive design</li>
        <li>• Integration with external systems</li>
      </ul>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const { theme } = useThemeStore();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Apply theme on app load
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'attendance':
        return <PlaceholderComponent title="Take Attendance" />;
      case 'my-attendance':
        return <PlaceholderComponent title="My Attendance" />;
      case 'child-attendance':
        return <PlaceholderComponent title="Child Attendance" />;
      case 'classes':
        return <PlaceholderComponent title="Manage Classes" />;
      case 'students':
        return <PlaceholderComponent title="Manage Students" />;
      case 'reports':
        return <PlaceholderComponent title="Reports & Analytics" />;
      case 'leave-requests':
        return <PlaceholderComponent title="Leave Requests" />;
      case 'notifications':
        return <PlaceholderComponent title="Notifications" />;
      case 'qr-scanner':
        return <PlaceholderComponent title="QR Scanner" />;
      case 'security':
        return <PlaceholderComponent title="Security Settings" />;
      case 'settings':
        return <PlaceholderComponent title="System Settings" />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <LoginForm />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            duration: 4000,
          }}
        />
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 4000,
        }}
      />
    </Router>
  );
}

export default App;