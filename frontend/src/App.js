import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import { ToastProvider } from './components/common/Toast';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailsPage from './pages/courses/CourseDetailsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import CategoryDetailsPage from './pages/categories/CategoryDetailsPage';
import UsersPage from './pages/users/UsersPage';
import RolesPage from './pages/roles/RolesPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import TeachersPage from './pages/teachers/TeachersPage';
import StudentsPage from './pages/students/StudentsPage';
import StaffsPage from './pages/staffs/StaffsPage';
import MyCoursesPage from './pages/courses/MyCoursesPage';
import EnrollmentsPage from './pages/enrollments/EnrollmentsPage';
import PaymentsPage from './pages/payments/PaymentsPage';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:categoryId" element={<CategoryDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/staffs" element={<StaffsPage />} />

              <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/enrollments" element={<EnrollmentsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/roles" element={<RolesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
