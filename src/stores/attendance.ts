import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceRecord, StudentAttendance, Class, Student, AttendanceMethod, AttendanceSettings } from '../types';

interface AttendanceState {
  attendanceRecords: AttendanceRecord[];
  classes: Class[];
  students: Student[];
  currentSession: Partial<AttendanceRecord> | null;
  settings: AttendanceSettings;
  
  // Actions
  initializeAttendanceSession: (classId: string, subject: string, period: number) => void;
  markAttendance: (studentId: string, status: StudentAttendance['status'], method?: AttendanceMethod) => void;
  saveAttendanceSession: () => Promise<boolean>;
  getAttendanceHistory: (filters: AttendanceFilters) => AttendanceRecord[];
  getStudentAttendanceStats: (studentId: string, dateRange?: DateRange) => StudentAttendanceStats;
  getClassAttendanceStats: (classId: string, dateRange?: DateRange) => ClassAttendanceStats;
  bulkMarkAttendance: (attendanceData: { studentId: string; status: StudentAttendance['status'] }[]) => void;
  generateQRCode: (sessionId: string) => Promise<string>;
  processQRAttendance: (qrData: string, studentId: string) => Promise<boolean>;
  updateSettings: (settings: Partial<AttendanceSettings>) => void;
}

interface AttendanceFilters {
  classId?: string;
  studentId?: string;
  subject?: string;
  startDate?: Date;
  endDate?: Date;
  status?: StudentAttendance['status'];
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface StudentAttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface ClassAttendanceStats {
  totalSessions: number;
  averageAttendanceRate: number;
  studentsAtRisk: string[];
  dailyStats: { date: string; rate: number }[];
}

// Mock data initialization
const initializeData = () => {
  const mockClasses: Class[] = [
    {
      id: '1',
      name: 'Grade 10 - Section A',
      section: 'A',
      grade: '10',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'],
      teacherId: '2',
      students: ['1', '2', '3', '4'],
      schedule: [
        { day: 'Monday', subject: 'Mathematics', startTime: '09:00', endTime: '10:00', room: 'R101' },
        { day: 'Monday', subject: 'Physics', startTime: '10:00', endTime: '11:00', room: 'Lab1' },
        { day: 'Tuesday', subject: 'Chemistry', startTime: '09:00', endTime: '10:00', room: 'Lab2' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Grade 11 - Science',
      section: 'Science',
      grade: '11',
      subjects: ['Advanced Math', 'Physics', 'Chemistry', 'Biology'],
      teacherId: '2',
      students: ['5', '6'],
      schedule: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockStudents: Student[] = [
    {
      id: '1',
      rollNo: '2024001',
      name: 'Alice Johnson',
      email: 'alice@student.edu',
      classId: '1',
      parentIds: ['4'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      rollNo: '2024002',
      name: 'Bob Smith',
      email: 'bob@student.edu',
      classId: '1',
      parentIds: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      rollNo: '2024003',
      name: 'Carol Davis',
      email: 'carol@student.edu',
      classId: '1',
      parentIds: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      rollNo: '2024004',
      name: 'David Wilson',
      email: 'david@student.edu',
      classId: '1',
      parentIds: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      rollNo: '2024005',
      name: 'Eva Brown',
      email: 'eva@student.edu',
      classId: '2',
      parentIds: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      rollNo: '2024006',
      name: 'Frank Miller',
      email: 'frank@student.edu',
      classId: '2',
      parentIds: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Generate sample attendance records
  const generateSampleAttendance = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockClasses.forEach(classObj => {
        const classStudents = mockStudents.filter(s => s.classId === classObj.id);
        
        classObj.subjects.slice(0, 2).forEach((subject, periodIndex) => {
          const studentRecords: StudentAttendance[] = classStudents.map(student => ({
            studentId: student.id,
            status: Math.random() > 0.15 ? 'present' : Math.random() > 0.5 ? 'absent' : 'late',
            timestamp: new Date(date.getTime() + (9 + periodIndex) * 60 * 60 * 1000),
            method: 'manual',
          }));

          records.push({
            id: `${classObj.id}-${subject}-${date.toISOString().split('T')[0]}-${periodIndex + 1}`,
            classId: classObj.id,
            subject,
            date: date.toISOString().split('T')[0],
            period: periodIndex + 1,
            teacherId: classObj.teacherId,
            records: studentRecords,
            method: 'manual',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      });
    }
    
    return records;
  };

  return {
    classes: mockClasses,
    students: mockStudents,
    attendanceRecords: generateSampleAttendance(),
  };
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => {
      const initialData = initializeData();
      
      return {
        attendanceRecords: initialData.attendanceRecords,
        classes: initialData.classes,
        students: initialData.students,
        currentSession: null,
        settings: {
          autoMarkThreshold: 15,
          minimumAttendancePercentage: 75,
          allowLateEntry: true,
          requireGPSVerification: false,
          enableFaceRecognition: false,
          enableQRCode: true,
          notificationSettings: {
            parentAlerts: true,
            teacherDigest: true,
            lowAttendanceThreshold: 70,
          },
        },

        initializeAttendanceSession: (classId: string, subject: string, period: number) => {
          const today = new Date().toISOString().split('T')[0];
          const session: Partial<AttendanceRecord> = {
            classId,
            subject,
            date: today,
            period,
            teacherId: '2', // Current user ID
            records: [],
            method: 'manual',
          };
          
          const { students } = get();
          const classStudents = students.filter(s => s.classId === classId);
          
          session.records = classStudents.map(student => ({
            studentId: student.id,
            status: 'absent', // Default to absent
            timestamp: new Date(),
            method: 'manual',
          }));

          set({ currentSession: session });
        },

        markAttendance: (studentId: string, status: StudentAttendance['status'], method = 'manual') => {
          const { currentSession } = get();
          if (!currentSession || !currentSession.records) return;

          const updatedRecords = currentSession.records.map(record =>
            record.studentId === studentId
              ? { ...record, status, timestamp: new Date(), method }
              : record
          );

          set({
            currentSession: {
              ...currentSession,
              records: updatedRecords,
            },
          });
        },

        saveAttendanceSession: async () => {
          const { currentSession, attendanceRecords } = get();
          if (!currentSession || !currentSession.classId) return false;

          const newRecord: AttendanceRecord = {
            id: `${currentSession.classId}-${currentSession.subject}-${currentSession.date}-${currentSession.period}`,
            classId: currentSession.classId,
            subject: currentSession.subject!,
            date: currentSession.date!,
            period: currentSession.period!,
            teacherId: currentSession.teacherId!,
            records: currentSession.records!,
            method: currentSession.method!,
            location: currentSession.location,
            notes: currentSession.notes,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Remove existing record if it exists (update scenario)
          const filteredRecords = attendanceRecords.filter(
            record => record.id !== newRecord.id
          );

          set({
            attendanceRecords: [...filteredRecords, newRecord],
            currentSession: null,
          });

          return true;
        },

        getAttendanceHistory: (filters: AttendanceFilters) => {
          const { attendanceRecords } = get();
          
          return attendanceRecords.filter(record => {
            if (filters.classId && record.classId !== filters.classId) return false;
            if (filters.subject && record.subject !== filters.subject) return false;
            if (filters.startDate && new Date(record.date) < filters.startDate) return false;
            if (filters.endDate && new Date(record.date) > filters.endDate) return false;
            if (filters.studentId) {
              const hasStudent = record.records.some(r => r.studentId === filters.studentId);
              if (!hasStudent) return false;
            }
            if (filters.status) {
              const hasStatus = record.records.some(r => r.status === filters.status);
              if (!hasStatus) return false;
            }
            return true;
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },

        getStudentAttendanceStats: (studentId: string, dateRange?: DateRange) => {
          const { attendanceRecords } = get();
          
          let relevantRecords = attendanceRecords;
          if (dateRange) {
            relevantRecords = relevantRecords.filter(record => {
              const recordDate = new Date(record.date);
              return recordDate >= dateRange.startDate && recordDate <= dateRange.endDate;
            });
          }

          const studentRecords = relevantRecords
            .map(record => record.records.find(r => r.studentId === studentId))
            .filter(Boolean) as StudentAttendance[];

          const totalSessions = studentRecords.length;
          const presentCount = studentRecords.filter(r => r.status === 'present').length;
          const absentCount = studentRecords.filter(r => r.status === 'absent').length;
          const lateCount = studentRecords.filter(r => r.status === 'late').length;
          const excusedCount = studentRecords.filter(r => r.status === 'excused').length;
          
          const attendanceRate = totalSessions > 0 ? (presentCount + lateCount) / totalSessions * 100 : 0;

          // Calculate trend (simplified)
          const recentRecords = studentRecords.slice(0, 10);
          const olderRecords = studentRecords.slice(10, 20);
          const recentRate = recentRecords.length > 0 ? 
            recentRecords.filter(r => r.status === 'present' || r.status === 'late').length / recentRecords.length * 100 : 0;
          const olderRate = olderRecords.length > 0 ? 
            olderRecords.filter(r => r.status === 'present' || r.status === 'late').length / olderRecords.length * 100 : 0;
          
          let trend: 'improving' | 'declining' | 'stable' = 'stable';
          if (recentRate > olderRate + 5) trend = 'improving';
          else if (recentRate < olderRate - 5) trend = 'declining';

          return {
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            excusedCount,
            attendanceRate,
            trend,
          };
        },

        getClassAttendanceStats: (classId: string, dateRange?: DateRange) => {
          const { attendanceRecords, students } = get();
          
          let relevantRecords = attendanceRecords.filter(record => record.classId === classId);
          if (dateRange) {
            relevantRecords = relevantRecords.filter(record => {
              const recordDate = new Date(record.date);
              return recordDate >= dateRange.startDate && recordDate <= dateRange.endDate;
            });
          }

          const totalSessions = relevantRecords.length;
          const classStudents = students.filter(s => s.classId === classId);
          
          let totalPresent = 0;
          let totalPossible = 0;
          const dailyStats: { date: string; rate: number }[] = [];
          const studentAttendanceRates: { [key: string]: number } = {};

          relevantRecords.forEach(record => {
            const presentCount = record.records.filter(r => r.status === 'present' || r.status === 'late').length;
            const totalStudents = record.records.length;
            
            totalPresent += presentCount;
            totalPossible += totalStudents;
            
            const rate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;
            dailyStats.push({ date: record.date, rate });

            // Track individual student rates
            record.records.forEach(r => {
              if (!studentAttendanceRates[r.studentId]) {
                studentAttendanceRates[r.studentId] = 0;
              }
            });
          });

          // Calculate students at risk
          const studentsAtRisk: string[] = [];
          classStudents.forEach(student => {
            const stats = get().getStudentAttendanceStats(student.id, dateRange);
            if (stats.attendanceRate < get().settings.notificationSettings.lowAttendanceThreshold) {
              studentsAtRisk.push(student.id);
            }
          });

          const averageAttendanceRate = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

          return {
            totalSessions,
            averageAttendanceRate,
            studentsAtRisk,
            dailyStats: dailyStats.slice(-30), // Last 30 days
          };
        },

        bulkMarkAttendance: (attendanceData: { studentId: string; status: StudentAttendance['status'] }[]) => {
          const { currentSession } = get();
          if (!currentSession || !currentSession.records) return;

          const updatedRecords = currentSession.records.map(record => {
            const attendanceItem = attendanceData.find(item => item.studentId === record.studentId);
            return attendanceItem
              ? { ...record, status: attendanceItem.status, timestamp: new Date(), method: 'bulk' as AttendanceMethod }
              : record;
          });

          set({
            currentSession: {
              ...currentSession,
              records: updatedRecords,
            },
          });
        },

        generateQRCode: async (sessionId: string) => {
          // This would generate a QR code in a real implementation
          const QRCode = await import('qrcode');
          const qrData = JSON.stringify({
            sessionId,
            timestamp: Date.now(),
            expiry: Date.now() + 300000, // 5 minutes
          });
          
          return await QRCode.toDataURL(qrData);
        },

        processQRAttendance: async (qrData: string, studentId: string) => {
          try {
            const data = JSON.parse(qrData);
            if (Date.now() > data.expiry) {
              throw new Error('QR code expired');
            }

            // Mark attendance
            get().markAttendance(studentId, 'present', 'qr');
            return true;
          } catch (error) {
            return false;
          }
        },

        updateSettings: (newSettings: Partial<AttendanceSettings>) => {
          const { settings } = get();
          set({ settings: { ...settings, ...newSettings } });
        },
      };
    },
    {
      name: 'attendance-storage',
    }
  )
);