import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../auth/AuthContext';
import { apiLogin } from '../../api/authApi';
import { apiGetMe } from '../../api/usersApi';
import { saveTokens } from '../../auth/tokenUtils';

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(4, 'Too short').required('Password is required'),
});

const Feature = ({ title, text }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
    <p className="text-sm font-semibold text-white mb-1">{title}</p>
    <p className="text-xs text-slate-400 leading-5">{text}</p>
  </div>
);

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const tokens = await apiLogin(values.email, values.password);
        saveTokens(tokens.access_token, tokens.refresh_token);
        const me = await apiGetMe();
        login(tokens.access_token, tokens.refresh_token, me);
        navigate('/dashboard');
      } catch (err) {
        setServerError(err?.response?.data?.detail || 'Invalid email or password.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#070b14] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.15),transparent_28%)]" />
      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between p-10 xl:p-14 border-r border-white/10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Modern learning workspace
            </div>
            <h1 className="mt-8 text-5xl leading-tight font-display font-bold text-white max-w-xl">
              Run your course management system like a real product.
            </h1>
            <p className="mt-5 text-base text-slate-300 max-w-xl leading-8">
              Manage users, courses, categories, thumbnails, and role-based dashboards in one polished workspace connected to your FastAPI backend.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-3xl">
            <Feature title="Admin control" text="Track users, courses, categories, and dashboard numbers from one place." />
            <Feature title="Teacher workflow" text="See assigned courses, upload learning assets, and follow teaching activity." />
            <Feature title="Media ready" text="Show course thumbnails and uploaded content directly from your backend." />
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-500 text-white font-bold text-lg shadow-glow">CM</div>
              <h1 className="mt-4 text-3xl font-display font-bold text-white">Course Command</h1>
            </div>
            <div className="card p-7 md:p-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.24em] text-brand-300 mb-2">Welcome back</p>
                <h2 className="text-3xl font-display font-bold text-white">Sign in</h2>
                <p className="text-sm text-slate-400 mt-2">Use your real backend account to enter the dashboard.</p>
              </div>

              {serverError && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{serverError}</div>}

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <input className="input-field" name="email" type="email" placeholder="admin@example.com" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-400">{formik.errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <input className="input-field" name="password" type="password" placeholder="••••••••" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  {formik.touched.password && formik.errors.password && <p className="mt-1 text-xs text-red-400">{formik.errors.password}</p>}
                </div>
                <button type="submit" disabled={formik.isSubmitting} className="btn-primary w-full !rounded-2xl !py-3">
                  {formik.isSubmitting ? 'Signing in...' : 'Enter workspace'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/10 text-sm text-slate-400 flex items-center justify-between">
                <span>Need a new account?</span>
                <Link to="/register" className="text-brand-300 hover:text-brand-200 font-medium">Open register form</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
