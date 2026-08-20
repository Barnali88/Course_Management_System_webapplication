import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../components/common/Toast';
import { apiGetMyEnrollments } from '../../api/enrollmentsApi';
import { apiGetCourses } from '../../api/coursesApi';
import { getImageUrl } from '../../api/axiosInstance';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [enrollments, allCourses] = await Promise.all([
          apiGetMyEnrollments().catch(() => []),
          apiGetCourses().catch(() => []),
        ]);

        const confirmedCourseIds = (enrollments || [])
          .filter((item) => item.status === 'confirmed')
          .map((item) => String(item.course_id));

        const purchasedCourses = (allCourses || []).filter((course) =>
          confirmedCourseIds.includes(String(course.id))
        );

        setCourses(purchasedCourses);
      } catch (err) {
        toast.show(err?.response?.data?.detail || 'Failed to load my courses', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Courses"
          subtitle="Courses you have purchased and can access."
        />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="h-64 rounded-[28px] bg-white/5 animate-pulse" />
          <div className="h-64 rounded-[28px] bg-white/5 animate-pulse" />
          <div className="h-64 rounded-[28px] bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        subtitle="Courses you have purchased and can access."
      />

      {courses.length ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-[28px] overflow-hidden border border-white/10 bg-white/[0.04]"
            >
              <div className="h-48 bg-white/5">
                {course.thumbnail ? (
                  <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-display font-bold text-white">{course.title}</h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-3">
                  {course.description || 'No description available.'}
                </p>

                <button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="btn-primary !rounded-2xl mt-4"
                >
                  Open Course
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-slate-400">
          You have not purchased any course yet.
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;