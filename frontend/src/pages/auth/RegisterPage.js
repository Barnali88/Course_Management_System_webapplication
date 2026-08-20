import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { apiCreateUser } from '../../api/usersApi';

const STUDENT_ROLE_ID = 3;

const schema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const getErrorMessage = (err) => {
  const detail = err?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return 'Registration failed. Please try again.';
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setError('');
      setMessage('');

      try {
        await apiCreateUser({
          name: values.name,
          email: values.email,
          password: values.password,
          role_id: STUDENT_ROLE_ID,
        });

        setMessage('Account created successfully. You can now log in.');
        resetForm();

        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card p-7 md:p-8 bg-white/5 border-white/10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-300 mb-2">Register</p>
        <h1 className="text-3xl font-display font-bold text-white">Create account</h1>
        <p className="text-sm text-slate-400 mt-2">
          Create a new student account to access the course platform.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        ) : null}

        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Full name
            </label>
            <input
              className="input-field"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name ? (
              <p className="mt-1 text-xs text-red-400">{formik.errors.name}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              className="input-field"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="mt-1 text-xs text-red-400">{formik.errors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              className="input-field"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password ? (
              <p className="mt-1 text-xs text-red-400">{formik.errors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="btn-primary w-full !rounded-2xl !py-3"
          >
            {formik.isSubmitting ? 'Submitting...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-300">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;