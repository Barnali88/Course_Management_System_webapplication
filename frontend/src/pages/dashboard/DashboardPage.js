import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiGetDashboardStats } from '../../api/dashboardApi';
import { apiGetCourses } from '../../api/coursesApi';
import { apiGetUsers } from '../../api/usersApi';
import { apiGetCategories } from '../../api/categoriesApi';
import { apiGetTeachers } from '../../api/teachersApi';
import PageHeader from '../../components/common/PageHeader';
import { getDisplayName } from '../../utils/roles';
import { getImageUrl } from '../../api/axiosInstance';

const MiniCard = ({ label, value, hint }) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
    <p className="mt-3 text-3xl font-display font-bold text-white">{value}</p>
    {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
  </div>
);

const HeroPanel = ({ title, text, actions }) => (
  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-brand-600/20 via-white/5 to-fuchsia-600/10 p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
    <p className="text-xs uppercase tracking-[0.24em] text-brand-200 mb-3">Workspace overview</p>
    <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">{title}</h2>
    <p className="mt-4 max-w-2xl text-sm md:text-base text-slate-300 leading-7">{text}</p>
    <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
  </div>
);

const getUserRoleName = (user) => {
  const directRole = (user?.role?.name || user?.role || user?.role_name || '').toLowerCase();
  if (directRole) return directRole;

  if (user?.role_id === 1) return 'admin';
  if (user?.role_id === 2) return 'teacher';
  if (user?.role_id === 3) return 'student';
  if (user?.role_id === 4) return 'staff';

  return '';
};

const DashboardPage = () => {
  const { user, hasRole, roleName } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [coursesData, categoriesData, teachersData] = await Promise.all([
          apiGetCourses().catch(() => []),
          apiGetCategories().catch(() => []),
          apiGetTeachers().catch(() => []),
        ]);

        setCourses(coursesData || []);
        setCategories(categoriesData || []);
        setTeachers(teachersData || []);

        if (hasRole(['admin', 'staff'])) {
          const [statsData, usersData] = await Promise.all([
            apiGetDashboardStats().catch(() => null),
            apiGetUsers().catch(() => []),
          ]);

          setStats(statsData);
          setUsers(usersData || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasRole]);

  const teacherProfile = useMemo(() => {
    if (!user) return null;
    return (teachers || []).find((teacher) => String(teacher.user_id) === String(user.id)) || null;
  }, [teachers, user]);

  const myCourses = useMemo(() => {
    if (hasRole('teacher')) {
      if (!teacherProfile) return [];
      return courses.filter((course) => String(course.teacher_id) === String(teacherProfile.id));
    }
    return courses;
  }, [courses, teacherProfile, hasRole]);

  const recentCourses = myCourses.slice(0, 3);
  const displayName = getDisplayName(user);

  const teacherCount = users.filter((u) => getUserRoleName(u) === 'teacher').length;
  const studentCount = users.filter((u) => getUserRoleName(u) === 'student').length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (hasRole(['admin', 'staff'])) {
    return (
      <div className="space-y-7">
        <PageHeader
          title={`Welcome back, ${displayName}`}
          subtitle={`You are signed in as ${roleName || 'member'}. Here's a live snapshot of your management workspace.`}
        />

        <HeroPanel
          title="Control your learning platform from one place"
          text="Track users, courses, categories, revenue trends, and recent platform activity. Use the action shortcuts below to manage your system faster from the frontend, not only from Swagger."
          actions={[
            <Link key="users" to="/users" className="btn-primary !rounded-2xl">
              Manage users
            </Link>,
            <Link key="courses" to="/courses" className="btn-secondary !rounded-2xl">
              Open courses
            </Link>,
            <Link key="categories" to="/categories" className="btn-secondary !rounded-2xl">
              Open categories
            </Link>,
          ]}
        />

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          <MiniCard label="Users" value={users.length} hint="All registered accounts" />
          <MiniCard label="Courses" value={courses.length} hint="Published learning items" />
          <MiniCard label="Categories" value={categories.length} hint="Course grouping structure" />
          <MiniCard label="Teachers" value={teacherCount} hint="Teaching accounts" />
          <MiniCard label="Students" value={studentCount} hint="Learners in the system" />
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="card p-6 bg-white/[0.04] border-white/10 rounded-[28px]">
            <h3 className="section-title mb-4">Quick management board</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {users.slice(0, 4).map((u) => (
                <div key={u.id} className="rounded-2xl bg-white/5 border border-white/8 p-4">
                  <p className="text-sm font-semibold text-white">{u.name || u.email}</p>
                  <p className="text-xs text-slate-400 mt-1">{u.email}</p>
                  <p className="text-xs capitalize text-brand-200 mt-3">
                    {u.role?.name || u.role || u.role_name || getUserRoleName(u) || 'member'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-white/[0.04] border-white/10 rounded-[28px]">
            <h3 className="section-title mb-4">Recent courses</h3>
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-center gap-3 rounded-2xl p-3 hover:bg-white/5 transition"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                    {getImageUrl(course.thumbnail || course.thumbnail_url) ? (
                      <img
                        src={getImageUrl(course.thumbnail || course.thumbnail_url)}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{course.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {course.description || 'No description yet'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasRole('teacher')) {
    return (
      <div className="space-y-7">
        <PageHeader
          title={`Hello, ${displayName}`}
          subtitle="Your teaching workspace is focused on your assigned courses and latest activity."
        />
        <HeroPanel
          title="Teach, update, and manage your assigned courses"
          text="Use your dashboard to review teaching load, update course thumbnails and materials, and keep your course content fresh from the frontend."
          actions={[
            <Link key="courses" to="/courses" className="btn-primary !rounded-2xl">
              Go to my courses
            </Link>,
            <Link key="profile" to="/profile" className="btn-secondary !rounded-2xl">
              Edit profile
            </Link>,
          ]}
        />
        <div className="grid md:grid-cols-3 gap-4">
          <MiniCard label="Assigned courses" value={myCourses.length} hint="Courses linked to your teacher profile" />
          <MiniCard label="Categories" value={categories.length} hint="Available course groups" />
          <MiniCard label="Active courses" value={myCourses.filter((course) => course.is_active).length} hint="Currently active classes" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {myCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="card rounded-[28px] overflow-hidden border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition"
            >
              <div className="h-44 bg-white/5">
                {getImageUrl(course.thumbnail || course.thumbnail_url) && (
                  <img
                    src={getImageUrl(course.thumbnail || course.thumbnail_url)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                  {course.description || 'No description available yet.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title={`Hi, ${displayName}`}
        subtitle="Your learner area shows the available course catalog and account shortcuts."
      />
      <HeroPanel
        title="Explore the course catalog and keep your profile updated"
        text="This space is designed for browsing learning content, checking available categories, and accessing your account information from a polished frontend."
        actions={[
          <Link key="courses" to="/courses" className="btn-primary !rounded-2xl">
            Browse courses
          </Link>,
          <Link key="profile" to="/profile" className="btn-secondary !rounded-2xl">
            My profile
          </Link>,
        ]}
      />
      <div className="grid md:grid-cols-3 gap-4">
        <MiniCard label="Available courses" value={courses.length} hint="Visible courses from your API" />
        <MiniCard label="Categories" value={categories.length} hint="Browse by topic" />
        <MiniCard label="Role" value={(roleName || 'member').toUpperCase()} hint="Current signed-in access level" />
      </div>
    </div>
  );
};

export default DashboardPage;