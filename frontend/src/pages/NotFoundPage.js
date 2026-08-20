// src/pages/NotFoundPage.js
import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center p-4">
    <div className="text-center">
      <p className="font-display text-8xl font-bold text-surface-border select-none">404</p>
      <h1 className="text-xl font-semibold text-white mt-2 mb-1">Page Not Found</h1>
      <p className="text-slate-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary inline-block">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
