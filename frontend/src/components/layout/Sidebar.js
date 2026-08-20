import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { canManageUsers, getDisplayName } from '../../utils/roles';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', section: 'main', icon: 'home' },
  { label: 'Courses', to: '/courses', section: 'learning', icon: 'book' },
  {label: 'My Courses',
    to: '/my-courses',
    section: 'learning',
    icon: 'book',
    allow: (user) =>
      user &&
      (
        user.role?.name === 'student' ||
        user.role === 'student' ||
        user.role_id === 3 ||
        user.role_name === 'student'
      ),
  },
  { label: 'Categories', to: '/categories', section: 'learning', icon: 'tag' },

  { label: 'Users', to: '/users', section: 'manage', icon: 'users', allow: canManageUsers },
  {
    label: 'Teachers',
    to: '/teachers',
    section: 'manage',
    icon: 'users',
    allow: (user) =>
      user &&
      (
        user.role?.name === 'admin' ||
        user.role === 'admin' ||
        user.role_id === 1 ||
        user.role_name === 'admin' ||
        user.role?.name === 'staff' ||
        user.role === 'staff' ||
        user.role_id === 4 ||
        user.role_name === 'staff'
      ),
  },
  {
    label: 'Students',
    to: '/students',
    section: 'manage',
    icon: 'users',
    allow: (user) =>
      user &&
      (
        user.role?.name === 'admin' ||
        user.role === 'admin' ||
        user.role_id === 1 ||
        user.role_name === 'admin' ||
        user.role?.name === 'staff' ||
        user.role === 'staff' ||
        user.role_id === 4 ||
        user.role_name === 'staff'
      ),
  },
  {
    label: 'Staffs',
    to: '/staffs',
    section: 'manage',
    icon: 'users',
    allow: (user) =>
      user &&
      (
        user.role?.name === 'admin' ||
        user.role === 'admin' ||
        user.role_id === 1 ||
        user.role_name === 'admin' ||
        user.role?.name === 'staff' ||
        user.role === 'staff' ||
        user.role_id === 4 ||
        user.role_name === 'staff'
      ),
  },
  {
    label: 'Roles',
    to: '/roles',
    section: 'manage',
    icon: 'shield',
    allow: (user) =>
      user &&
      (
        user.role?.name === 'admin' ||
        user.role === 'admin' ||
        user.role_id === 1 ||
        user.role_name === 'admin'
      ),
  },

  {
    label: 'Enrollments',
    to: '/enrollments',
    section: 'manage',
    icon: 'book',
    allow: (user) =>
      user &&
      (
        user.role?.name === 'admin' ||
        user.role === 'admin' ||
        user.role_id === 1 ||
        user.role_name === 'admin' ||
        user.role?.name === 'staff' ||
        user.role === 'staff' ||
        user.role_id === 4 ||
        user.role_name === 'staff'
      ),
  },
  {
    label: 'Payments',
    to: '/payments',
    section: 'manage',
    icon: 'shield',
    allow: (user) =>
      user &&
      (
        user.role?.name === 'admin' ||
        user.role === 'admin' ||
        user.role_id === 1 ||
        user.role_name === 'admin' ||
        user.role?.name === 'staff' ||
        user.role === 'staff' ||
        user.role_id === 4 ||
        user.role_name === 'staff'
      ),
  },

  { label: 'Profile', to: '/profile', section: 'account', icon: 'profile' },
];

const Icon = ({ name }) => {
  const icons = {
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10.5L12 3l9 7.5M5.25 9.75V21h13.5V9.75" />,
    book: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.25v12.5m0-12.5C10.75 5.5 9.15 5 7.5 5c-1.8 0-3.4.6-4.5 1.25v12.5C4.1 18.1 5.7 17.5 7.5 17.5c1.65 0 3.25.5 4.5 1.25m0-12.5C13.25 5.5 14.85 5 16.5 5c1.8 0 3.4.6 4.5 1.25v12.5c-1.1-.65-2.7-1.25-4.5-1.25-1.65 0-3.25.5-4.5 1.25" />,
    tag: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M4 11.5V7a3 3 0 013-3h4.5a3 3 0 012.12.88l5.5 5.5a3 3 0 010 4.24l-4.38 4.38a3 3 0 01-4.24 0l-5.5-5.5A3 3 0 014 11.5z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 19h5v-1a3 3 0 00-5.356-1.857M16 19H8m8 0v-1c0-.64-.13-1.25-.36-1.81M8 19H3v-1a3 3 0 015.36-1.86M8 19v-1c0-.64.13-1.25.36-1.81m0 0a4.75 4.75 0 018.28 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l7.5 3v5.2c0 4.85-3.2 9.23-7.5 10.8-4.3-1.57-7.5-5.95-7.5-10.8V6L12 3zM9.5 11.75l1.75 1.75 3.25-3.5" />,
    profile: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0" />,
  };

  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name]}
    </svg>
  );
};

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, roleName, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => !item.allow || item.allow(user));
  const grouped = ['main', 'learning', 'manage', 'account'];

  return (
    <aside
      className={`hidden md:flex md:shrink-0 flex-col h-screen sticky top-0 self-start overflow-hidden border-r border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="px-5 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-glow flex items-center justify-center text-white font-bold">
            CM
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-lg font-bold text-white tracking-tight truncate">
                Course Command
              </div>
              <div className="text-xs text-slate-400 truncate">
                Learning management workspace
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-4 flex-1 min-h-0 overflow-y-auto">
        {grouped.map((section) => {
          const items = visibleItems.filter((i) => i.section === section);
          if (!items.length) return null;

          return (
            <div key={section} className="mb-6">
              {!collapsed && (
                <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  {section}
                </p>
              )}

              <div className="space-y-1.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-white text-slate-950 shadow-lg'
                          : 'text-slate-300 hover:bg-white/6 hover:text-white'
                      }`
                    }
                  >
                    <span className="flex-shrink-0">
                      <Icon name={item.icon} />
                    </span>
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600 to-fuchsia-600 flex items-center justify-center text-white font-semibold">
              {getDisplayName(user)?.[0]?.toUpperCase() || 'U'}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {getDisplayName(user)}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {roleName || 'member'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;