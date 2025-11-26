import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  enable2FA: () => Promise<string>;
  disable2FA: (code: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@school.edu',
    name: 'System Administrator',
    role: 'admin',
    permissions: ['all'],
    lastLogin: new Date(),
    is2FAEnabled: false,
  },
  {
    id: '2',
    email: 'teacher@school.edu',
    name: 'John Smith',
    role: 'teacher',
    classId: '1',
    permissions: ['attendance:read', 'attendance:write', 'students:read'],
    lastLogin: new Date(),
    is2FAEnabled: false,
  },
  {
    id: '3',
    email: 'student@school.edu',
    name: 'Alice Johnson',
    role: 'student',
    classId: '1',
    permissions: ['attendance:read'],
    lastLogin: new Date(),
    is2FAEnabled: false,
  },
  {
    id: '4',
    email: 'parent@school.edu',
    name: 'Robert Johnson',
    role: 'parent',
    studentIds: ['3'],
    permissions: ['attendance:read'],
    lastLogin: new Date(),
    is2FAEnabled: false,
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, twoFactorCode?: string) => {
        set({ isLoading: true });
        
        try {
          // Mock authentication
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = mockUsers.find(u => u.email === email);
          if (!user || password !== 'password123') {
            throw new Error('Invalid credentials');
          }

          if (user.is2FAEnabled && !twoFactorCode) {
            throw new Error('2FA code required');
          }

          if (user.is2FAEnabled && twoFactorCode !== '123456') {
            throw new Error('Invalid 2FA code');
          }

          user.lastLogin = new Date();
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) return false;

        const updatedUser = { ...user, ...data };
        set({ user: updatedUser });
        return true;
      },

      enable2FA: async () => {
        // Mock 2FA secret generation
        const secret = 'JBSWY3DPEHPK3PXP';
        const { user } = get();
        if (user) {
          set({ 
            user: { 
              ...user, 
              is2FAEnabled: true, 
              twoFactorSecret: secret 
            } 
          });
        }
        return secret;
      },

      disable2FA: async (code: string) => {
        if (code !== '123456') return false;
        
        const { user } = get();
        if (user) {
          set({ 
            user: { 
              ...user, 
              is2FAEnabled: false, 
              twoFactorSecret: undefined 
            } 
          });
        }
        return true;
      },

      resetPassword: async (email: string) => {
        // Mock password reset
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockUsers.some(user => user.email === email);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);