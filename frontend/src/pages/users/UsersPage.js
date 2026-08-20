import React, { useEffect, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiUploadProfileImage } from '../../api/usersApi';
import { apiGetRoles } from '../../api/rolesApi';
import { getImageUrl } from '../../api/axiosInstance';
import { useToast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { getRoleName } from '../../utils/roles';

const createSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
  role_id: Yup.number().required('Role is required'),
});

const updateSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  role_id: Yup.number().required('Role is required'),
});

const UsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [imageTarget, setImageTarget] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([apiGetUsers(), apiGetRoles().catch(() => [])]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch {
      toast.show('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const schema = editingUser ? updateSchema : createSchema;

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', role_id: '' },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          name: values.name,
          email: values.email,
          role_id: Number(values.role_id),
        };

        if (!editingUser && values.password) {
          payload.password = values.password;
        }

        if (editingUser) {
          await apiUpdateUser(editingUser.id, payload);
          toast.show('User updated', 'success');
        } else {
          await apiCreateUser(payload);
          toast.show('User created', 'success');
        }

        setModalOpen(false);
        setEditingUser(null);
        resetForm();
        load();
      } catch (err) {
        toast.show(err?.response?.data?.detail || 'Failed to save user', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openEdit = (user) => {
    setEditingUser(user);
    formik.setValues({ name: user.name || '', email: user.email || '', password: '', role_id: user.role_id || roles.find((role) => role.name?.toLowerCase() === getRoleName(user).toLowerCase())?.id || '' });
    setModalOpen(true);
  };

  const filtered = users.filter((user) => `${user.name || ''} ${user.email || ''} ${getRoleName(user)}`.toLowerCase().includes(search.toLowerCase()));

  const uploadImage = async () => {
    if (!imageTarget || !imageFile) return;
    try {
      await apiUploadProfileImage(imageTarget.id, imageFile);
      toast.show('Profile image updated', 'success');
      setImageTarget(null);
      setImageFile(null);
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Image upload failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Create, edit, and visually manage users with role-aware frontend controls." action={<button onClick={() => { setEditingUser(null); formik.resetForm(); setModalOpen(true); }} className="btn-primary !rounded-2xl">Add user</button>} />
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 md:p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <span className="badge-blue">Users: {users.length}</span>
          <span className="badge-gray">Active: {users.filter((user) => user.is_active).length}</span>
        </div>
        <input className="input-field max-w-sm" placeholder="Search users by name, email, or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="grid xl:grid-cols-2 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-[28px] bg-white/5 animate-pulse" />)}</div> : null}
      {!loading && <div className="grid xl:grid-cols-2 gap-5">
        {filtered.map((user) => (
          <div key={user.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 flex gap-4">
            <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-white/5 shrink-0 flex items-center justify-center text-2xl font-bold text-white">
              {getImageUrl(user.image || user.profile_image || user.avatar) ? <img src={getImageUrl(user.image || user.profile_image || user.avatar)} alt={user.name || user.email} className="w-full h-full object-cover" /> : (user.name || user.email || 'U')[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white truncate">{user.name || 'Unnamed user'}</p>
                  <p className="text-sm text-slate-400 truncate">{user.email}</p>
                </div>
                <span className="badge-gray capitalize">{getRoleName(user) || 'member'}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => openEdit(user)} className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm">Edit</button>
                <button onClick={() => { setImageTarget(user); setImageFile(null); }} className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm">Profile image</button>
              </div>
            </div>
          </div>
        ))}
      </div>}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingUser(null); formik.resetForm(); }} title={editingUser ? 'Edit user' : 'Create user'} size="sm">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <FormInput label="Full name" name="name" placeholder="John Doe" formik={formik} />
          <FormInput label="Email" name="email" type="email" placeholder="user@example.com" formik={formik} />
          {!editingUser && <FormInput label="Password" name="password" type="password" placeholder="••••••••" formik={formik} />}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <select name="role_id" value={formik.values.role_id} onChange={formik.handleChange} onBlur={formik.handleBlur} className="input-field bg-white text-slate-900">
              <option value="">Select role</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
            {formik.touched.role_id && formik.errors.role_id && <p className="mt-1 text-xs text-red-400">{formik.errors.role_id}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setModalOpen(false); setEditingUser(null); formik.resetForm(); }} className="btn-secondary !rounded-2xl">Cancel</button>
            <button type="submit" className="btn-primary !rounded-2xl" disabled={formik.isSubmitting}>{formik.isSubmitting ? 'Saving...' : editingUser ? 'Update user' : 'Create user'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!imageTarget} onClose={() => { setImageTarget(null); setImageFile(null); }} title="Upload profile image" size="sm">
        <div className="space-y-4">
          <input type="file" accept="image/*" className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-2xl file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white hover:file:bg-brand-500" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setImageTarget(null); setImageFile(null); }} className="btn-secondary !rounded-2xl">Cancel</button>
            <button onClick={uploadImage} className="btn-primary !rounded-2xl" disabled={!imageFile}>Save image</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
