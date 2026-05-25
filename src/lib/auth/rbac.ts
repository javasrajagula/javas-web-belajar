import { UserRole } from '@/types';

// Role-Based Access Control (RBAC) mapping for Academy OS Ω
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  student: [
    '/dashboard',
    '/subjects',
    '/brain',
    '/tutor',
    '/rpg',
    '/planner',
    '/exams',
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
    '/subjects',
    '/lessons',
    '/profile',
    '/analytics',
    '/teacher'
  ],
  school: [
    '/dashboard',
    '/subjects',
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
