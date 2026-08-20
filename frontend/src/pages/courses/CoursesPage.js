import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../auth/AuthContext';
import {
  apiGetCourses,
  apiCreateCourse,
  apiUpdateCourse,
  apiUploadThumbnail,
} from '../../api/coursesApi';
import { apiGetCategories } from '../../api/categoriesApi';
import { apiGetTeachers, apiGetTeacherByUserId } from '../../api/teachersApi';
import { getImageUrl } from '../../api/axiosInstance';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { useToast } from '../../components/common/Toast';

const schema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().typeError('Price must be a number').required('Price is required'),
  category_id: Yup.number().typeError('Category is required').required('Category is required'),
  teacher_id: Yup.number().typeError('Teacher is required').required('Teacher is required'),
});

const canAddCourses = (user) => {
  const role = (user?.role?.name || user?.role || user?.role_name || '').toLowerCase();
  if (role === 'admin' || role === 'staff') return true;
  if (user?.role_id === 1 || user?.role_id === 4) return true;
  return false;
};

const canManageThumbnail = (user) => {
  const role = (user?.role?.name || user?.role || user?.role_name || '').toLowerCase();
  if (role === 'admin' || role === 'staff') return true;
  if ([1, 4].includes(user?.role_id)) return true;
  return false;
};

const getTeacherName = (teacher) => {
  return teacher?.user?.name || teacher?.name || `Teacher ID ${teacher?.id}`;
};

const CoursesPage = () => {
  const toast = useToast();
  const { user, hasRole } = useAuth();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [thumbnailTarget, setThumbnailTarget] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const allowAdd = canAddCourses(user);
  const allowThumbnailActions = canManageThumbnail(user);

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

      if (hasRole('teacher') && user?.id) {
        const ownTeacherProfile = await apiGetTeacherByUserId(user.id).catch(() => null);
        setTeacherProfile(ownTeacherProfile || null);
      } else {
        setTeacherProfile(null);
      }
    } catch {
      toast.show('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category.name || category.title || `Category ${category.id}`;
    });
    return map;
  }, [categories]);

  const teacherMap = useMemo(() => {
    const map = {};
    teachers.forEach((teacher) => {
      map[teacher.id] = getTeacherName(teacher);
    });
    return map;
  }, [teachers]);

  const visibleCourses = useMemo(() => {
    let list = [...courses];

    if (hasRole('teacher')) {
      if (!teacherProfile) return [];
      list = list.filter((course) => String(course.teacher_id) === String(teacherProfile.id));
    }

    if (selectedCategory) {
      list = list.filter((course) => String(course.category_id) === String(selectedCategory));
    }

    if (selectedTeacher) {
      list = list.filter((course) => String(course.teacher_id) === String(selectedTeacher));
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter((course) => {
        const categoryName = (categoryMap[course.category_id] || '').toLowerCase();
        const teacherName = (teacherMap[course.teacher_id] || '').toLowerCase();

        const searchableText = `
          ${course.title || ''}
          ${course.description || ''}
          ${categoryName}
          ${teacherName}
        `.toLowerCase();

        return searchableText.includes(q);
      });
    }

    return list;
  }, [
    courses,
    search,
    selectedCategory,
    selectedTeacher,
    hasRole,
    teacherProfile,
    categoryMap,
    teacherMap,
  ]);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      price: '',
      category_id: '',
      teacher_id: '',
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          title: values.title,
          description: values.description,
          price: Number(values.price),
          category_id: Number(values.category_id),
          teacher_id: Number(values.teacher_id),
        };

        if (editingCourse) {
          await apiUpdateCourse(editingCourse.id, payload);
          toast.show('Course updated', 'success');
        } else {
          await apiCreateCourse(payload);
          toast.show('Course created', 'success');
        }

        setModalOpen(false);
        setEditingCourse(null);
        resetForm();
        load();
      } catch (err) {
        toast.show(err?.response?.data?.detail || 'Failed to save course', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openEdit = (course) => {
    setEditingCourse(course);
    formik.setValues({
      title: course.title || '',
      description: course.description || '',
      price: course.price || '',
      category_id: course.category_id || '',
      teacher_id: course.teacher_id || '',
    });
    setModalOpen(true);
  };

  const uploadThumbnail = async () => {
    if (!thumbnailTarget || !thumbnailFile) return;
    try {
      await apiUploadThumbnail(thumbnailTarget.id, thumbnailFile);
      toast.show('Thumbnail updated', 'success');
      setThumbnailTarget(null);
      setThumbnailFile(null);
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Thumbnail upload failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle={
          hasRole('teacher')
            ? 'View and manage materials for your assigned courses.'
            : 'Browse and explore course content from the frontend.'
        }
        action={
          allowAdd ? (
            <button
              onClick={() => {
                setEditingCourse(null);
                formik.resetForm();
                setModalOpen(true);
              }}
              className="btn-primary !rounded-2xl"
            >
              Add course
            </button>
          ) : null
        }
      />

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <span className="badge-blue">Total: {visibleCourses.length}</span>
          <span className="badge-gray">
            With thumbnails: {visibleCourses.filter((course) => course.thumbnail || course.thumbnail_url).length}
          </span>
          <span className="badge-gray">
            Active: {visibleCourses.filter((course) => course.is_active).length}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="input-field bg-white text-slate-900"
            placeholder="Search by title, keyword, category, or teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="input-field bg-white text-slate-900"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name || category.title}
              </option>
            ))}
          </select>

          <select
            className="input-field bg-white text-slate-900"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">All teachers</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {getTeacherName(teacher)}
              </option>
            ))}
          </select>
        </div>

        {(search || selectedCategory || selectedTeacher) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedTeacher('');
              }}
              className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid xl:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 rounded-[28px] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : null}

      {!loading && (
        <div className="grid xl:grid-cols-2 gap-5">
          {visibleCourses.length ? (
            visibleCourses.map((course) => (
              <div key={course.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] overflow-hidden">
                <Link to={`/courses/${course.id}`} className="block">
                  <div className="h-52 bg-white/5">
                    {getImageUrl(course.thumbnail || course.thumbnail_url) ? (
                      <img
                        src={getImageUrl(course.thumbnail || course.thumbnail_url)}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                </Link>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/courses/${course.id}`} className="block">
                        <h3 className="text-xl font-semibold text-white truncate">{course.title}</h3>
                      </Link>
                      <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {course.description || 'No description yet'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="badge-gray">{categoryMap[course.category_id] || 'Unknown category'}</span>
                        <span className="badge-gray">{teacherMap[course.teacher_id] || 'Unknown teacher'}</span>
                      </div>
                    </div>

                    <span className="badge-gray">${course.price ?? 0}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {allowThumbnailActions ? (
                      <button
                        onClick={() => {
                          setThumbnailTarget(course);
                          setThumbnailFile(null);
                        }}
                        className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                      >
                        Thumbnail
                      </button>
                    ) : null}

                    {allowAdd ? (
                      <button
                        onClick={() => openEdit(course)}
                        className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center text-slate-400">
              No courses matched your search or filters.
            </div>
          )}
        </div>
      )}

      {allowAdd ? (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingCourse(null);
            formik.resetForm();
          }}
          title={editingCourse ? 'Edit course' : 'Create course'}
          size="sm"
        >
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <FormInput label="Title" name="title" placeholder="Course title" formik={formik} />
            <FormInput label="Description" name="description" placeholder="Course description" formik={formik} />
            <FormInput label="Price" name="price" type="number" placeholder="0" formik={formik} />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <select
                className="input-field bg-white text-slate-900"
                name="category_id"
                value={formik.values.category_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name || category.title}
                  </option>
                ))}
              </select>
              {formik.touched.category_id && formik.errors.category_id ? (
                <p className="mt-1 text-xs text-red-400">{formik.errors.category_id}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Teacher</label>
              <select
                className="input-field bg-white text-slate-900"
                name="teacher_id"
                value={formik.values.teacher_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {getTeacherName(teacher)}
                  </option>
                ))}
              </select>
              {formik.touched.teacher_id && formik.errors.teacher_id ? (
                <p className="mt-1 text-xs text-red-400">{formik.errors.teacher_id}</p>
              ) : null}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingCourse(null);
                  formik.resetForm();
                }}
                className="btn-secondary !rounded-2xl"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary !rounded-2xl" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Saving...' : editingCourse ? 'Update course' : 'Create course'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      <Modal
        isOpen={!!thumbnailTarget}
        onClose={() => {
          setThumbnailTarget(null);
          setThumbnailFile(null);
        }}
        title="Upload course thumbnail"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-2xl file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white hover:file:bg-brand-500"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setThumbnailTarget(null);
                setThumbnailFile(null);
              }}
              className="btn-secondary !rounded-2xl"
            >
              Cancel
            </button>
            <button onClick={uploadThumbnail} className="btn-primary !rounded-2xl" disabled={!thumbnailFile}>
              Save thumbnail
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CoursesPage;