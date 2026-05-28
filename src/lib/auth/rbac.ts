import { UserRole } from '@/types';

// Role-Based Access Control (RBAC) mapping for Academy OS Ω
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  student: [
    '/dashboard',
    '/materi',
    '/video-panduan',
    '/buku-modul',
    '/subjects',
    '/bank-soal',
    '/ujian',
    '/brain',
    '/tutor',
    '/rpg',
    '/planner',
    '/exams',
    '/jurusan',
    '/profile',
    '/settings',
    '/analytics',
    '/galaxy'
  ],
  parent: [
    '/dashboard',
    '/profile',
    '/analytics'
  ],
  teacher: [
    '/dashboard',
    '/materi',
    '/video-panduan',
    '/buku-modul',
    '/subjects',
    '/bank-soal',
    '/ujian',
    '/lessons',
    '/profile',
    '/analytics',
    '/teacher'
  ],
  school: [
    '/dashboard',
    '/materi',
    '/video-panduan',
    '/buku-modul',
    '/subjects',
    '/bank-soal',
    '/ujian',
    '/profile',
    '/analytics',
    '/settings'
  ],
  admin: [
    '*' // Full Access
  ]
};

export const hasRouteAccess = (role: UserRole, route: string): boolean => {
  const allowedRoutes = ROLE_PERMISSIONS[role] || [];
  if (allowedRoutes.includes('*')) return true;
  
  // Check exact or prefix match
  return allowedRoutes.some((allowed) => route.startsWith(allowed));
};
