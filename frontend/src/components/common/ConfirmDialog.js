// src/components/common/ConfirmDialog.js
import React from "react";
import Modal from "./Modal";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Are you sure?", message, confirmText = "Delete", loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-slate-400 text-sm mb-5">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">
        Cancel
      </button>
      <button onClick={onConfirm} disabled={loading} className="btn-danger">
        {loading ? "Deleting..." : confirmText}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
