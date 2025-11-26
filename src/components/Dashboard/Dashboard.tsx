import React, { useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import AttendanceChart from './AttendanceChart';
import RecentActivityTable from './RecentActivityTable';
import { useAttendanceStore } from '../../stores/attendance';
import { useAuthStore } from '../../stores/auth';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { attendanceRecords, classes, students, getStudentAttendanceStats, getClassAttendanceStats } = useAttendanceStore();

  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date();
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);

    // Today's attendance
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    const todayAttendanceCount = todayRecords.length;

    // Monthly attendance
    const monthlyRecords = attendanceRecords.filter(record => 
      new Date(record.date) >= firstDayOfMonth
    );
    const monthlyAttendanceCount = monthlyRecords.length;

    // Calculate attendance rates
    let totalPresent = 0;
    let totalPossible = 0;
    let studentsAtRisk = 0;

    attendanceRecords.forEach(record => {
      const presentCount = record.records.filter(r => r.status === 'present' || r.status === 'late').length;
      totalPresent += presentCount;
      totalPossible += record.records.length;
    });

    const averageAttendanceRate = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

    // Students at risk (attendance < 75%)
    students.forEach(student => {
      const stats = getStudentAttendanceStats(student.id);
      if (stats.attendanceRate < 75) {
        studentsAtRisk++;
      }
    });

    return {
      totalStudents: students.length,
      totalClasses: classes.length,
      todayAttendance: todayAttendanceCount,
      monthlyAttendance: monthlyAttendanceCount,
      averageAttendanceRate: Math.round(averageAttendanceRate),
      studentsAtRisk,
    };
  }, [attendanceRecords, classes, students, getStudentAttendanceStats]);

  const quickActions = [
    {
      title: 'Take Attendance',
      description: 'Mark attendance for your classes',
      icon: UserCheck,
      color: 'blue' as const,
      action: () => onNavigate('attendance'),
      roles: ['admin', 'teacher'],
    },
    {
      title: 'View Reports',
      description: 'Generate attendance reports',
      icon: TrendingUp,
      color: 'green' as const,
      action: () => onNavigate('reports'),
      roles: ['admin', 'teacher'],
    },
    {
      title: 'Manage Students',
      description: 'Add or edit student information',
      icon: Users,
      color: 'purple' as const,
      action: () => onNavigate('students'),
      roles: ['admin', 'teacher'],
    },
    {
      title: 'QR Scanner',
      description: 'Scan QR code for attendance',
      icon: Calendar,
      color: 'orange' as const,
      action: () => onNavigate('qr-scanner'),
      roles: ['student'],
    },
  ];

  const filteredQuickActions = quickActions.filter(action => 
    user && action.roles.includes(user.role)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening in your attendance system today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Sessions"
          value={dashboardStats.todayAttendance}
          subtitle="Attendance taken"
          icon={Calendar}
          color="blue"
          onClick={() => onNavigate('attendance')}
        />
        <StatsCard
          title="Total Classes"
          value={dashboardStats.totalClasses}
          subtitle="Active classes"
          icon={BookOpen}
          color="green"
          onClick={() => onNavigate('classes')}
        />
        <StatsCard
          title="Total Students"
          value={dashboardStats.totalStudents}
          subtitle="Enrolled students"
          icon={Users}
          color="purple"
          onClick={() => onNavigate('students')}
        />
        <StatsCard
          title="Avg. Attendance"
          value={`${dashboardStats.averageAttendanceRate}%`}
          subtitle="This month"
          icon={TrendingUp}
          color="orange"
          trend={{
            value: 5.2,
            label: 'vs last month',
            isPositive: true,
          }}
          onClick={() => onNavigate('reports')}
        />
      </motion.div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Attendance Overview
            </h3>
            <button 
              onClick={() => onNavigate('reports')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <AttendanceChart />
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button 
              onClick={() => onNavigate('reports')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <RecentActivityTable />
        </motion.div>
      </div>

      {/* At Risk Students Alert */}
      {dashboardStats.studentsAtRisk > 0 && (
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                Students Need Attention
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200 mt-1">
                {dashboardStats.studentsAtRisk} students have attendance below 75%. 
                Consider reaching out to them or their parents.
              </p>
              <button 
                onClick={() => onNavigate('students')}
                className="mt-3 inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View Students
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredQuickActions.map((action, index) => (
            <motion.button
              key={action.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className={`inline-flex p-3 rounded-lg ${
                action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                action.color === 'green' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' :
                action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' :
                'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
              }`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
                {action.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {action.description}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;