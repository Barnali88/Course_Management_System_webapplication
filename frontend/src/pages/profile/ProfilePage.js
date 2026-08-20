import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../auth/AuthContext';
import { apiUpdateUser, apiUploadProfileImage } from '../../api/usersApi';
import {
  apiGetMyStudentProfile,
  apiCreateMyStudentProfile,
  apiUpdateMyStudentProfile,
} from '../../api/studentsApi';
import {
  apiGetMyTeacherProfile,
  apiCreateMyTeacherProfile,
  apiUpdateMyTeacherProfile,
} from '../../api/teachersApi';
import { getImageUrl } from '../../api/axiosInstance';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../components/common/Toast';
import { getDisplayName } from '../../utils/roles';

const accountSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string(),
});

const studentSchema = Yup.object({
  phone: Yup.string(),
  address: Yup.string(),
  date_of_birth: Yup.string(),
});

const teacherSchema = Yup.object({
  bio: Yup.string(),
  phone: Yup.string(),
  expertise: Yup.string(),
});

const ProfilePage = () => {
  const { user, refreshProfile, roleName, hasRole } = useAuth();
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const [teacherProfile, setTeacherProfile] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(false);

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!hasRole('student')) {
        setStudentProfile(null);
        return;
      }

      setLoadingStudent(true);
      try {
        const student = await apiGetMyStudentProfile().catch(() => null);
        setStudentProfile(student || null);
      } finally {
        setLoadingStudent(false);
      }
    };

    loadStudentProfile();
  }, [hasRole]);

  useEffect(() => {
    const loadTeacherProfile = async () => {
      if (!hasRole('teacher')) {
        setTeacherProfile(null);
        return;
      }

      setLoadingTeacher(true);
      try {
        const teacher = await apiGetMyTeacherProfile().catch(() => null);
        setTeacherProfile(teacher || null);
      } finally {
        setLoadingTeacher(false);
      }
    };

    loadTeacherProfile();
  }, [hasRole]);

  const accountFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    },
    validationSchema: accountSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          name: values.name,
          email: values.email,
        };

        if (values.password?.trim()) {
          payload.password = values.password;
        }

        await apiUpdateUser(user.id, payload);
        await refreshProfile();

        resetForm({
          values: {
            name: values.name,
            email: values.email,
            password: '',
          },
        });

        toast.show('Account updated successfully', 'success');
      } catch (err) {
        toast.show(err?.response?.data?.detail || 'Failed to update account', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const studentFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      phone: studentProfile?.phone || '',
      address: studentProfile?.address || '',
      date_of_birth: studentProfile?.date_of_birth || '',
    },
    validationSchema: studentSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          phone: values.phone || null,
          address: values.address || null,
          date_of_birth: values.date_of_birth || null,
        };

        let saved;
        if (studentProfile?.id) {
          saved = await apiUpdateMyStudentProfile(payload);
          toast.show('Student profile updated successfully', 'success');
        } else {
          saved = await apiCreateMyStudentProfile(payload);
          toast.show('Student profile created successfully', 'success');
        }

        setStudentProfile(saved);
      } catch (err) {
        toast.show(err?.response?.data?.detail || 'Failed to save student profile', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const teacherFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      bio: teacherProfile?.bio || '',
      phone: teacherProfile?.phone || '',
      expertise: teacherProfile?.expertise || '',
    },
    validationSchema: teacherSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          bio: values.bio || null,
          phone: values.phone || null,
          expertise: values.expertise || null,
        };

        let saved;
        if (teacherProfile?.id) {
          saved = await apiUpdateMyTeacherProfile(payload);
          toast.show('Teacher profile updated successfully', 'success');
        } else {
          saved = await apiCreateMyTeacherProfile(payload);
          toast.show('Teacher profile created successfully', 'success');
        }

        setTeacherProfile(saved);
      } catch (err) {
        toast.show(err?.response?.data?.detail || 'Failed to save teacher profile', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await apiUploadProfileImage(user.id, file);
      await refreshProfile();
      toast.show('Profile image uploaded', 'success');
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const profileImage = getImageUrl(user?.image || user?.profile_image || user?.avatar);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        subtitle="Update your account, password, image, and profile information."
      />

      <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
        <div className="card p-6 rounded-[28px] bg-white/[0.04] border-white/10">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-[28px] overflow-hidden bg-white/5 flex items-center justify-center text-3xl font-bold text-white">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={getDisplayName(user)}
                  className="w-full h-full object-cover"
                />
              ) : (
                getDisplayName(user)?.[0]?.toUpperCase()
              )}
            </div>

            <h2 className="mt-5 text-2xl font-display font-bold text-white">
              {getDisplayName(user)}
            </h2>
            <p className="mt-1 text-sm capitalize text-slate-400">{roleName || 'member'}</p>

            <label className="btn-secondary !rounded-2xl mt-5 cursor-pointer">
              {uploading ? 'Uploading...' : 'Upload image'}
              <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
            </label>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Email</span>
              <span className="font-medium text-white break-all text-right">{user?.email}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Role</span>
              <span className="font-medium text-white capitalize">{roleName || 'member'}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Status</span>
              <span className="font-medium text-white">{user?.is_active ? 'Active' : 'Inactive'}</span>
            </div>

            {hasRole('teacher') && teacherProfile?.phone ? (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Phone</span>
                <span className="font-medium text-white text-right break-words">
                  {teacherProfile.phone}
                </span>
              </div>
            ) : null}

            {hasRole('teacher') && teacherProfile?.expertise ? (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Expertise</span>
                <span className="font-medium text-white text-right break-words">
                  {teacherProfile.expertise}
                </span>
              </div>
            ) : null}

            {hasRole('teacher') && teacherProfile?.bio ? (
              <div className="flex justify-between gap-4 items-start">
                <span className="text-slate-400">Bio</span>
                <span className="font-medium text-white text-right break-words max-w-[65%]">
                  {teacherProfile.bio}
                </span>
              </div>
            ) : null}

            {hasRole('student') && studentProfile?.phone ? (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Phone</span>
                <span className="font-medium text-white text-right">{studentProfile.phone}</span>
              </div>
            ) : null}

            {hasRole('student') && studentProfile?.address ? (
              <div className="flex justify-between gap-4 items-start">
                <span className="text-slate-400">Address</span>
                <span className="font-medium text-white text-right break-words max-w-[65%]">
                  {studentProfile.address}
                </span>
              </div>
            ) : null}

            {hasRole('student') && studentProfile?.date_of_birth ? (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Date of birth</span>
                <span className="font-medium text-white text-right">
                  {studentProfile.date_of_birth}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 rounded-[28px] bg-white/[0.04] border-white/10">
            <h3 className="section-title mb-5">Edit account information</h3>

            <form onSubmit={accountFormik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
                <input
                  className="input-field"
                  name="name"
                  value={accountFormik.values.name}
                  onChange={accountFormik.handleChange}
                  onBlur={accountFormik.handleBlur}
                />
                {accountFormik.touched.name && accountFormik.errors.name ? (
                  <p className="mt-1 text-xs text-red-400">{accountFormik.errors.name}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  className="input-field"
                  name="email"
                  type="email"
                  value={accountFormik.values.email}
                  onChange={accountFormik.handleChange}
                  onBlur={accountFormik.handleBlur}
                />
                {accountFormik.touched.email && accountFormik.errors.email ? (
                  <p className="mt-1 text-xs text-red-400">{accountFormik.errors.email}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
                <input
                  className="input-field"
                  name="password"
                  type="password"
                  placeholder="Leave empty if you do not want to change it"
                  value={accountFormik.values.password}
                  onChange={accountFormik.handleChange}
                  onBlur={accountFormik.handleBlur}
                />
              </div>

              <button
                type="submit"
                className="btn-primary !rounded-2xl"
                disabled={accountFormik.isSubmitting}
              >
                {accountFormik.isSubmitting ? 'Saving...' : 'Save account changes'}
              </button>
            </form>
          </div>

          {hasRole('teacher') ? (
            <div className="card p-6 rounded-[28px] bg-white/[0.04] border-white/10">
              <h3 className="section-title mb-5">
                {teacherProfile ? 'Teacher profile details' : 'Complete your teacher profile'}
              </h3>

              {loadingTeacher ? (
                <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
              ) : (
                <form onSubmit={teacherFormik.handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                    <input
                      className="input-field"
                      name="phone"
                      value={teacherFormik.values.phone}
                      onChange={teacherFormik.handleChange}
                      onBlur={teacherFormik.handleBlur}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Expertise
                    </label>
                    <input
                      className="input-field"
                      name="expertise"
                      value={teacherFormik.values.expertise}
                      onChange={teacherFormik.handleChange}
                      onBlur={teacherFormik.handleBlur}
                      placeholder="Example: API Backend, Python, Web Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                    <textarea
                      className="input-field min-h-[120px]"
                      name="bio"
                      value={teacherFormik.values.bio}
                      onChange={teacherFormik.handleChange}
                      onBlur={teacherFormik.handleBlur}
                      placeholder="Write a short bio about yourself"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary !rounded-2xl"
                    disabled={teacherFormik.isSubmitting}
                  >
                    {teacherFormik.isSubmitting
                      ? 'Saving...'
                      : teacherProfile
                      ? 'Save teacher profile'
                      : 'Create teacher profile'}
                  </button>
                </form>
              )}
            </div>
          ) : null}

          {hasRole('student') ? (
            <div className="card p-6 rounded-[28px] bg-white/[0.04] border-white/10">
              <h3 className="section-title mb-5">
                {studentProfile ? 'Student profile details' : 'Complete your student profile'}
              </h3>

              {loadingStudent ? (
                <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
              ) : (
                <form onSubmit={studentFormik.handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                    <input
                      className="input-field"
                      name="phone"
                      value={studentFormik.values.phone}
                      onChange={studentFormik.handleChange}
                      onBlur={studentFormik.handleBlur}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
                    <textarea
                      className="input-field min-h-[100px]"
                      name="address"
                      value={studentFormik.values.address}
                      onChange={studentFormik.handleChange}
                      onBlur={studentFormik.handleBlur}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Date of birth
                    </label>
                    <input
                      className="input-field"
                      name="date_of_birth"
                      type="date"
                      value={studentFormik.values.date_of_birth}
                      onChange={studentFormik.handleChange}
                      onBlur={studentFormik.handleBlur}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary !rounded-2xl"
                    disabled={studentFormik.isSubmitting}
                  >
                    {studentFormik.isSubmitting
                      ? 'Saving...'
                      : studentProfile
                      ? 'Save student profile'
                      : 'Create student profile'}
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;