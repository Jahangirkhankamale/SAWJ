export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  classId?: string;
  studentIds?: string[]; // For parents
  phone?: string;
  permissions: string[];
  lastLogin?: Date;
  is2FAEnabled: boolean;
  twoFactorSecret?: string;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
  grade: string;
  subjects: string[];
  teacherId: string;
  students: string[];
  schedule: ClassSchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassSchedule {
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  phone?: string;
  classId: string;
  parentIds: string[];
  dateOfBirth?: Date;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  subject: string;
  date: string;
  period: number;
  teacherId: string;
  records: StudentAttendance[];
  method: AttendanceMethod;
  location?: GeolocationCoordinates;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
  timestamp?: Date;
  method?: AttendanceMethod;
  location?: GeolocationCoordinates;
  confidence?: number; // For AI-based recognition
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AttendanceMethod = 'manual' | 'qr' | 'biometric' | 'face' | 'gps' | 'bulk';

export interface LeaveRequest {
  id: string;
  studentId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  type: LeaveType;
  status: LeaveStatus;
  documents?: string[];
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LeaveType = 'sick' | 'personal' | 'family' | 'medical' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 'attendance' | 'leave' | 'announcement' | 'alert' | 'reminder';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AttendanceSettings {
  autoMarkThreshold: number; // Minutes late before marked absent
  minimumAttendancePercentage: number;
  allowLateEntry: boolean;
  requireGPSVerification: boolean;
  enableFaceRecognition: boolean;
  enableQRCode: boolean;
  notificationSettings: {
    parentAlerts: boolean;
    teacherDigest: boolean;
    lowAttendanceThreshold: number;
  };
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  todayAttendance: number;
  monthlyAttendance: number;
  averageAttendanceRate: number;
  lowAttendanceStudents: number;
  pendingLeaveRequests: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  parameters: ReportParameters;
  generatedBy: string;
  generatedAt: Date;
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
}

export type ReportType = 'attendance' | 'student' | 'class' | 'teacher' | 'summary' | 'register';

export interface ReportParameters {
  classId?: string;
  studentId?: string;
  startDate: Date;
  endDate: Date;
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  groupBy?: 'date' | 'class' | 'student' | 'subject';
}