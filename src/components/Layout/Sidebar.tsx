import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Settings, 
  Bell,
  Calendar,
  BarChart3,
  Shield,
  Smartphone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'attendance', label: 'Take Attendance', icon: UserCheck, roles: ['admin', 'teacher'] },
    { id: 'my-attendance', label: 'My Attendance', icon: Calendar, roles: ['student'] },
    { id: 'child-attendance', label: 'Child Attendance', icon: Users, roles: ['parent'] },
    { id: 'classes', label: 'Manage Classes', icon: BookOpen, roles: ['admin', 'teacher'] },
    { id: 'students', label: 'Manage Students', icon: Users, roles: ['admin', 'teacher'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'teacher'] },
    { id: 'leave-requests', label: 'Leave Requests', icon: FileText, roles: ['admin', 'teacher', 'student'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'qr-scanner', label: 'QR Scanner', icon: Smartphone, roles: ['student'] },
    { id: 'security', label: 'Security', icon: Shield, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'teacher'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <motion.div 
      className={`bg-white dark:bg-gray-900 h-full flex flex-col shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">AttendancePro</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Smart Attendance</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''} transition-colors`} />
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;