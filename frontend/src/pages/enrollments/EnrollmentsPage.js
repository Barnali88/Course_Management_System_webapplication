import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../components/common/Toast';
import {
  apiGetEnrollments,
  apiConfirmEnrollment,
  apiCancelEnrollment,
} from '../../api/enrollmentsApi';
import { apiGetCourses } from '../../api/coursesApi';
import { apiGetStudents } from '../../api/studentsApi';

const EnrollmentsPage = () => {
  const toast = useToast();

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [enrollmentData, courseData, studentData] = await Promise.all([
        apiGetEnrollments().catch(() => []),
        apiGetCourses().catch(() => []),
        apiGetStudents().catch(() => []),
      ]);

      setEnrollments(enrollmentData || []);
      setCourses(courseData || []);
      setStudents(studentData || []);
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to load enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getCourseTitle = (courseId) => {
    const course = courses.find((item) => String(item.id) === String(courseId));
    return course?.title || `Course ID ${courseId}`;
  };

  const getStudentName = (studentId) => {
    const student = students.find((item) => String(item.id) === String(studentId));
    return student?.user?.name || student?.name || `Student ID ${studentId}`;
  };

  const handleConfirm = async (enrollmentId) => {
    try {
      setActionLoadingId(enrollmentId);
      await apiConfirmEnrollment(enrollmentId);
      toast.show('Enrollment confirmed', 'success');
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to confirm enrollment', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (enrollmentId) => {
    try {
      setActionLoadingId(enrollmentId);
      await apiCancelEnrollment(enrollmentId);
      toast.show('Enrollment cancelled', 'success');
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to cancel enrollment', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-[28px] bg-white/5 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        subtitle="Review, confirm, and cancel course enrollments."
      />

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-slate-300">
                <th className="px-5 py-4 font-medium">Enrollment ID</th>
                <th className="px-5 py-4 font-medium">Student</th>
                <th className="px-5 py-4 font-medium">Course</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length ? (
                enrollments.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="px-5 py-4 text-white">{item.id}</td>
                    <td className="px-5 py-4 text-slate-300">{getStudentName(item.student_id)}</td>
                    <td className="px-5 py-4 text-slate-300">{getCourseTitle(item.course_id)}</td>
                    <td className="px-5 py-4">
                      <span className="badge-gray capitalize">{item.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleConfirm(item.id)}
                          className="btn-primary !rounded-2xl !px-4 !py-2 text-sm"
                          disabled={actionLoadingId === item.id || item.status === 'confirmed'}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                          disabled={actionLoadingId === item.id || item.status === 'cancelled'}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentsPage;