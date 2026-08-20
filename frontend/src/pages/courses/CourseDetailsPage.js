import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  apiGetCourse,
  apiCreateCourseMaterial,
  apiUpdateCourseMaterial,
  apiDeleteCourseMaterial,
  apiGetProtectedMaterial,
} from '../../api/coursesApi';
import { apiGetCategories } from '../../api/categoriesApi';
import { apiGetTeachers } from '../../api/teachersApi';
import { getImageUrl } from '../../api/axiosInstance';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../auth/AuthContext';
import { apiCreateEnrollment, apiGetMyEnrollments } from '../../api/enrollmentsApi';
import { apiCreatePayment } from '../../api/paymentsApi';
import { apiGetMyStudentProfile } from '../../api/studentsApi';

const getTeacherName = (teacher) => {
  return teacher?.user?.name || teacher?.name || `Teacher ID ${teacher?.id}`;
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { hasRole } = useAuth();

  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [studentProfile, setStudentProfile] = useState(null);
  const [buyingCourse, setBuyingCourse] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const canManageMaterials = hasRole('admin') || hasRole('staff') || hasRole('teacher');

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!hasRole('student')) {
        setStudentProfile(null);
        return;
      }

      try {
        const student = await apiGetMyStudentProfile().catch(() => null);
        setStudentProfile(student || null);
      } catch {
        setStudentProfile(null);
      }
    };

    loadStudentProfile();
  }, [hasRole]);

  const load = async () => {
    setLoading(true);
    try {
      const [courseData, categoriesData, teachersData] = await Promise.all([
        apiGetCourse(courseId).catch(() => null),
        apiGetCategories().catch(() => []),
        apiGetTeachers().catch(() => []),
      ]);

      setCourse(courseData || null);
      setCategories(categoriesData || []);
      setTeachers(teachersData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const categoryName = useMemo(() => {
    if (!course) return '';
    const category = categories.find((item) => String(item.id) === String(course.category_id));
    return category?.name || category?.title || 'Unknown category';
  }, [categories, course]);

  const teacherName = useMemo(() => {
    if (!course) return '';
    const teacher = teachers.find((item) => String(item.id) === String(course.teacher_id));
    return teacher ? getTeacherName(teacher) : 'Unknown teacher';
  }, [teachers, course]);

  const materials = course?.materials || [];

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!hasRole('student') || !course || !studentProfile) {
        setHasPurchased(false);
        return;
      }

      try {
        const enrollments = await apiGetMyEnrollments().catch(() => []);
        const alreadyPurchased = (enrollments || []).some(
          (item) =>
            String(item.course_id) === String(course.id) &&
            item.status === 'confirmed'
        );

        setHasPurchased(alreadyPurchased);
      } catch {
        setHasPurchased(false);
      }
    };

    checkPurchaseStatus();
  }, [course, studentProfile, hasRole]);

  const handleUploadMaterial = async () => {
    if (!materialTitle.trim() || !materialFile) {
      toast.show('Please add material title and choose a file', 'error');
      return;
    }

    try {
      setUploadingMaterial(true);
      await apiCreateCourseMaterial(course.id, materialTitle.trim(), materialFile);
      toast.show('Material uploaded successfully', 'success');
      setMaterialTitle('');
      setMaterialFile(null);
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to upload material', 'error');
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleOpenMaterial = async (material) => {
    try {
      let filePath = material.file_path;

      if (!canManageMaterials) {
        const allowed = await apiGetProtectedMaterial(course.id, material.id);
        filePath = allowed?.file_path;
      }

      if (filePath) {
        window.open(getImageUrl(filePath), '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'You cannot access this material yet', 'error');
    }
  };

  const handleStartEdit = (material) => {
    setEditingMaterialId(material.id);
    setEditingTitle(material.title || '');
  };

  const handleSaveEdit = async (materialId) => {
    if (!editingTitle.trim()) {
      toast.show('Title is required', 'error');
      return;
    }

    try {
      await apiUpdateCourseMaterial(course.id, materialId, editingTitle.trim());
      toast.show('Material title updated', 'success');
      setEditingMaterialId(null);
      setEditingTitle('');
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to update material', 'error');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    const confirmed = window.confirm('Are you sure you want to delete this material?');
    if (!confirmed) return;

    try {
      await apiDeleteCourseMaterial(course.id, materialId);
      toast.show('Material deleted', 'success');
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to delete material', 'error');
    }
  };

  const handleBuyCourse = async () => {
    if (!hasRole('student')) {
      toast.show('Only students can buy courses', 'error');
      return;
    }

    if (!studentProfile?.id) {
      toast.show('Student profile not found', 'error');
      return;
    }

    if (hasPurchased) {
      toast.show('You already purchased this course', 'success');
      return;
    }

    try {
      setBuyingCourse(true);

      const enrollment = await apiCreateEnrollment({
        student_id: studentProfile.id,
        course_id: course.id,
      });

      await apiCreatePayment({
        enrollment_id: enrollment.id,
        amount: course.price ?? 0,
        method: 'manual',
        transaction_id: `TXN-${Date.now()}`,
      });

      setHasPurchased(true);
      toast.show('Course purchased successfully', 'success');
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to buy course', 'error');
    } finally {
      setBuyingCourse(false);
    }
  };

  if (loading) {
    return (
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="h-[520px] rounded-[32px] bg-white/5 animate-pulse" />
        <div className="space-y-6">
          <div className="h-48 rounded-[32px] bg-white/5 animate-pulse" />
          <div className="h-64 rounded-[32px] bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="card p-8 rounded-[32px] bg-white/[0.04] border-white/10">
        <h2 className="text-2xl font-display font-bold text-white">Course not found</h2>
        <p className="mt-3 text-slate-400">
          The course you are looking for does not exist or could not be loaded.
        </p>
        <button onClick={() => navigate('/courses')} className="btn-primary !rounded-2xl mt-6">
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        subtitle="Detailed course view from your frontend workspace."
        action={
          <button onClick={() => navigate('/courses')} className="btn-secondary !rounded-2xl">
            Back
          </button>
        }
      />

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] overflow-hidden">
          <div className="h-[420px] bg-white/5">
            {getImageUrl(course.thumbnail || course.thumbnail_url) ? (
              <img
                src={getImageUrl(course.thumbnail || course.thumbnail_url)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-display font-bold text-white">{course.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {course.description || 'No description available yet.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-5">Course info</p>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Price</span>
                <span className="font-semibold text-white">${course.price ?? 0}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Category</span>
                <span className="font-semibold text-white text-right">{categoryName}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Teacher</span>
                <span className="font-semibold text-white text-right">{teacherName}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-white">{course.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            {hasRole('student') ? (
              <div className="pt-5">
                <button
                  onClick={handleBuyCourse}
                  className="btn-primary !rounded-2xl w-full"
                  disabled={buyingCourse || hasPurchased}
                >
                  {buyingCourse
                    ? 'Processing...'
                    : hasPurchased
                    ? 'Purchased'
                    : `Buy Course - $${course.price ?? 0}`}
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-5">Materials</p>

            {canManageMaterials ? (
              <div className="mb-6 space-y-3">
                <input
                  className="input-field bg-white text-slate-900"
                  placeholder="Material title"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                />

                <input
                  type="file"
                  className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-2xl file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white hover:file:bg-brand-500"
                  onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                />

                <button
                  onClick={handleUploadMaterial}
                  className="btn-primary !rounded-2xl"
                  disabled={uploadingMaterial}
                >
                  {uploadingMaterial ? 'Uploading...' : 'Upload material'}
                </button>
              </div>
            ) : null}

            {materials.length ? (
              <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    {editingMaterialId === material.id ? (
                      <div className="space-y-3">
                        <input
                          className="input-field bg-white text-slate-900"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleSaveEdit(material.id)}
                            className="btn-primary !rounded-2xl !px-4 !py-2 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingMaterialId(null);
                              setEditingTitle('');
                            }}
                            className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-white break-words">{material.title}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="badge-gray capitalize">{material.file_type || 'file'}</span>
                              <span className="badge-gray">
                                Uploaded: {formatDate(material.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleOpenMaterial(material)}
                            className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                          >
                            {canManageMaterials ? 'Open' : 'View'}
                          </button>

                          {canManageMaterials ? (
                            <>
                              <button
                                onClick={() => handleStartEdit(material)}
                                className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                              >
                                Delete
                              </button>
                            </>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No material uploaded yet.</p>
            )}

            {!canManageMaterials ? (
              <p className="mt-4 text-xs text-slate-500">
                Students can only open materials after buying or being enrolled in the course.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;