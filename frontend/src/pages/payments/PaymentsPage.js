import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../components/common/Toast';
import { apiGetPayments } from '../../api/paymentsApi';
import { apiGetEnrollments } from '../../api/enrollmentsApi';
import { apiGetCourses } from '../../api/coursesApi';
import { apiGetStudents } from '../../api/studentsApi';

const PaymentsPage = () => {
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const [paymentData, enrollmentData, courseData, studentData] = await Promise.all([
        apiGetPayments().catch(() => []),
        apiGetEnrollments().catch(() => []),
        apiGetCourses().catch(() => []),
        apiGetStudents().catch(() => []),
      ]);

      setPayments(paymentData || []);
      setEnrollments(enrollmentData || []);
      setCourses(courseData || []);
      setStudents(studentData || []);
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getEnrollment = (enrollmentId) =>
    enrollments.find((item) => String(item.id) === String(enrollmentId));

  const getCourseTitle = (enrollmentId) => {
    const enrollment = getEnrollment(enrollmentId);
    const course = courses.find((item) => String(item.id) === String(enrollment?.course_id));
    return course?.title || 'Unknown course';
  };

  const getStudentName = (enrollmentId) => {
    const enrollment = getEnrollment(enrollmentId);
    const student = students.find((item) => String(item.id) === String(enrollment?.student_id));
    return student?.user?.name || student?.name || 'Unknown student';
  };

  if (loading) {
    return <div className="h-64 rounded-[28px] bg-white/5 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Track student course payments and transaction details."
      />

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-slate-300">
                <th className="px-5 py-4 font-medium">Payment ID</th>
                <th className="px-5 py-4 font-medium">Student</th>
                <th className="px-5 py-4 font-medium">Course</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Method</th>
                <th className="px-5 py-4 font-medium">Transaction ID</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length ? (
                payments.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="px-5 py-4 text-white">{item.id}</td>
                    <td className="px-5 py-4 text-slate-300">{getStudentName(item.enrollment_id)}</td>
                    <td className="px-5 py-4 text-slate-300">{getCourseTitle(item.enrollment_id)}</td>
                    <td className="px-5 py-4 text-slate-300">${item.amount ?? 0}</td>
                    <td className="px-5 py-4 text-slate-300 capitalize">{item.method}</td>
                    <td className="px-5 py-4 text-slate-300">{item.transaction_id}</td>
                    <td className="px-5 py-4">
                      <span className="badge-gray capitalize">{item.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No payments found.
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

export default PaymentsPage;