// src/components/common/FormInput.js
// Works with Formik — pass field name and Formik helpers

import React from "react";

const FormInput = ({ label, name, type = "text", placeholder, formik, ...rest }) => {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={`input-field ${hasError ? "border-red-500 focus:ring-red-500" : ""}`}
        {...rest}
      />
      {hasError && (
        <p className="text-xs text-red-400">{formik.errors[name]}</p>
      )}
    </div>
  );
};

export default FormInput;
