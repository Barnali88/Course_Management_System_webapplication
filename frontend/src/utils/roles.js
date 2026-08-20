export const ROLE_ID_MAP = {
  1: 'admin',
  2: 'teacher',
  3: 'student',
  4: 'staff',
};

export const getRoleName = (userOrRole) => {
  if (!userOrRole) return '';
  if (typeof userOrRole === 'string') return userOrRole;
  if (typeof userOrRole === 'number') return ROLE_ID_MAP[userOrRole] || '';
  if (typeof userOrRole === 'object') {
    if (typeof userOrRole.role === 'string') return userOrRole.role;
    if (userOrRole.role?.name) return userOrRole.role.name;
    if (userOrRole.role_name) return userOrRole.role_name;
    if (userOrRole.role_id) return ROLE_ID_MAP[userOrRole.role_id] || '';
    if (userOrRole.name && !userOrRole.email) return userOrRole.name;
  }
  return '';
};

export const hasRole = (user, roles) => {
  const name = getRoleName(user).toLowerCase();
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.some((role) => role?.toLowerCase() === name);
};

export const canManageUsers = (user) => hasRole(user, ['admin', 'staff']);
export const canManageCourses = (user) => hasRole(user, ['admin', 'staff', 'teacher']);
export const canManageCategories = (user) => hasRole(user, ['admin', 'staff']);
export const canViewAdminArea = (user) => hasRole(user, ['admin', 'staff']);

export const getDisplayName = (user) => user?.name || user?.name || user?.email || 'User';
