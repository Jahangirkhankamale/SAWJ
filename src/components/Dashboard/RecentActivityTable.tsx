import React from 'react';
import { Clock, Users, BookOpen } from 'lucide-react';
import { useAttendanceStore } from '../../stores/attendance';

const RecentActivityTable: React.FC = () => {
  const { attendanceRecords, classes, students } = useAttendanceStore();

  // Get recent 5 attendance records
  const recentRecords = attendanceRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAttendanceRate = (records: any[]) => {
    if (records.length === 0) return 0;
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((presentCount / records.length) * 100);
  };

  if (recentRecords.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentRecords.map((record) => {
        const classData = classes.find(c => c.id === record.classId);
        const attendanceRate = getAttendanceRate(record.records);
        
        return (
          <div
            key={record.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg">
                <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {record.subject} - {classData?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(record.date)} • Period {record.period}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {record.records.filter(r => r.status === 'present' || r.status === 'late').length}/
                  {record.records.length}
                </span>
              </div>
              <div className={`text-xs font-medium mt-1 ${
                attendanceRate >= 80 
                  ? 'text-green-600 dark:text-green-400'
                  : attendanceRate >= 60
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {attendanceRate}% present
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivityTable;