import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory, apiUploadCategoryImage } from '../../api/categoriesApi';
import { useAuth } from '../../auth/AuthContext';
import { getImageUrl } from '../../api/axiosInstance';
import { useToast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { canManageCategories } from '../../utils/roles';

const catSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
});

const CategoriesPage = () => {
  const { user } = useAuth();
  const canEdit = canManageCategories(user);
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageTarget, setImageTarget] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removingImageId, setRemovingImageId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await apiGetCategories());
    } catch {
      toast.show('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const formik = useFormik({
    initialValues: { name: '', description: '' },
    validationSchema: catSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (editingCat) {
          await apiUpdateCategory(editingCat.id, values);
          toast.show('Category updated', 'success');
        } else {
          await apiCreateCategory(values);
          toast.show('Category created', 'success');
        }
        setModalOpen(false);
        setEditingCat(null);
        resetForm();
        load();
      } catch (err) {
        toast.show(err?.response?.data?.detail || 'Failed to save category', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiDeleteCategory(deleteTarget.id);
      toast.show('Category deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to delete category', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile || !imageTarget) return;
    setUploading(true);
    try {
      await apiUploadCategoryImage(imageTarget.id, imageFile);
      toast.show('Category image updated', 'success');
      setImageTarget(null);
      setImageFile(null);
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Failed to upload category image', 'error');
    } finally {
      setUploading(false);
    }
  };


  const handleRemoveImage = async (category) => {
    setRemovingImageId(category.id);
    try {
      await apiUpdateCategory(category.id, { name: category.name, description: category.description || '', image: null });
      toast.show('Category image removed', 'success');
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || 'Could not remove image with current backend schema', 'error');
    } finally {
      setRemovingImageId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle="Browse topics and manage category visuals directly from the frontend." action={canEdit && <button onClick={() => { setEditingCat(null); formik.resetForm(); setModalOpen(true); }} className="btn-primary !rounded-2xl">Add category</button>} />
      {loading ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-[28px] bg-white/5 animate-pulse" />)}</div> : null}
      {!loading && <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-[28px] overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <Link to={`/categories/${cat.id}`} className="block h-48 bg-white/5">{getImageUrl(cat.image) ? <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" /> : <div className="h-full flex items-center justify-center text-slate-500">No category image</div>}</Link>
            <div className="p-5 space-y-4">
              <div>
                <Link to={`/categories/${cat.id}`} className="text-lg font-semibold text-white hover:text-brand-200">{cat.name}</Link>
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">{cat.description || 'No description yet.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/categories/${cat.id}`} className="btn-secondary !rounded-2xl !px-4 !py-2 text-center text-sm">View</Link>
                {canEdit && <button onClick={() => { setEditingCat(cat); formik.setValues({ name: cat.name, description: cat.description || '' }); setModalOpen(true); }} className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm">Edit</button>}
                {canEdit && <button onClick={() => { setImageTarget(cat); setImageFile(null); }} className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm col-span-2">Replace image</button>}
                {canEdit && <button onClick={() => handleRemoveImage(cat)} disabled={removingImageId === cat.id} className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm col-span-2">{removingImageId === cat.id ? 'Removing...' : 'Remove image'}</button>}
                {canEdit && <button onClick={() => setDeleteTarget(cat)} className="btn-danger !rounded-2xl !px-4 !py-2 text-sm col-span-2">Delete category</button>}
              </div>
            </div>
          </div>
        ))}
      </div>}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingCat(null); formik.resetForm(); }} title={editingCat ? 'Edit category' : 'Create category'} size="sm">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <FormInput label="Name" name="name" placeholder="Web development" formik={formik} />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea name="description" rows={4} className="input-field resize-none" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => { setModalOpen(false); setEditingCat(null); formik.resetForm(); }} className="btn-secondary !rounded-2xl">Cancel</button>
            <button type="submit" className="btn-primary !rounded-2xl" disabled={formik.isSubmitting}>{formik.isSubmitting ? 'Saving...' : editingCat ? 'Update category' : 'Create category'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!imageTarget} onClose={() => { setImageTarget(null); setImageFile(null); }} title="Replace category image" size="sm">
        <div className="space-y-4">
          <input type="file" accept="image/*" className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-2xl file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white hover:file:bg-brand-500" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setImageTarget(null); setImageFile(null); }} className="btn-secondary !rounded-2xl">Cancel</button>
            <button onClick={handleUploadImage} disabled={!imageFile || uploading} className="btn-primary !rounded-2xl">{uploading ? 'Uploading...' : 'Save image'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} title="Delete category" message={`Delete "${deleteTarget?.name}" permanently?`} />
    </div>
  );
};

export default CategoriesPage;
