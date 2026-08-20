// src/pages/roles/RolesPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiGetRoles, apiCreateRole, apiDeleteRole } from "../../api/rolesApi";
import { useToast } from "../../components/common/Toast";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import FormInput from "../../components/common/FormInput";

const roleSchema = Yup.object({
  name: Yup.string().required("Role name is required"),
});

const ROLE_COLORS = {
  admin:   "badge-red",
  teacher: "badge-blue",
  staff:   "badge-yellow",
  student: "badge-green",
};

const RolesPage = () => {
  const toast = useToast();
  const [roles,  setRoles]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetRoles();
      setRoles(data);
    } catch {
      toast.show("Failed to load roles", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: roleSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await apiCreateRole(values);
        toast.show("Role created", "success");
        setModalOpen(false);
        resetForm();
        load();
      } catch (err) {
        toast.show(err?.response?.data?.detail || "Failed to create role", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiDeleteRole(deleteTarget.id);
      toast.show("Role deleted", "success");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || "Failed to delete role", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="Manage user roles and permissions"
        action={
          <button onClick={() => { formik.resetForm(); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Role
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-3 w-20 bg-surface-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {roles.length === 0 && (
            <p className="text-slate-400 text-sm col-span-full">No roles found.</p>
          )}
          {roles.map((role) => {
            const colorClass = ROLE_COLORS[role.name?.toLowerCase()] || "badge-gray";
            return (
              <div key={role.id} className="card p-4 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className={`badge ${colorClass} capitalize`}>{role.name}</span>
                </div>
                <button
                  onClick={() => setDeleteTarget(role)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Role" size="sm">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <FormInput label="Role Name" name="name" placeholder="e.g. teacher" formik={formik} />
          <p className="text-xs text-slate-500">Use lowercase, no spaces (e.g. admin, teacher, staff)</p>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={formik.isSubmitting} className="btn-primary">
              {formik.isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Role"
        message={`Delete the "${deleteTarget?.name}" role? Users with this role may be affected.`}
      />
    </div>
  );
};

export default RolesPage;
