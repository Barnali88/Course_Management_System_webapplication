// src/components/common/PageHeader.js
import React from "react";

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-7 gap-4">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
