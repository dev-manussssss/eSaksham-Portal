import React from 'react';

/**
 * 1. Button Primitive
 * Variants: primary, secondary, outline, ghost, danger
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon,
  disabled,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-[#1F497D] text-white hover:bg-[#16375D] active:bg-[#0F2642] shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

/**
 * 2. Input Primitive
 */
export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  required,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D] ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

/**
 * 3. Select Primitive
 */
export function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  id,
  required,
  placeholder = 'Select option...',
  className = '',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 transition-colors focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D] ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

/**
 * 4. Checkbox Primitive
 */
export function Checkbox({ label, checked, onChange, id, className = '', ...props }) {
  const checkId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <input
        type="checkbox"
        id={checkId}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-[#1F497D] border-slate-300 rounded focus:ring-[#1F497D]"
        {...props}
      />
      {label && (
        <label htmlFor={checkId} className="text-sm text-slate-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}

/**
 * 5. Badge Primitive
 */
export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }) {
  const variantClasses = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-[#EEF4FA] text-[#1F497D] border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size] || sizeClasses.sm} ${variantClasses[variant] || variantClasses.neutral} ${className}`}>
      {children}
    </span>
  );
}

/**
 * 6. StatusBadge Primitive strictly mapped to canonical PROJECT_STATUS (AUD-021)
 */
export function StatusBadge({ status, className = '' }) {
  const configs = {
    RECOMMENDED: { label: 'Recommended', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dot: 'bg-sky-500' },
    APPROVED: { label: 'Feasibility Cleared', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
    SANCTIONED: { label: 'Sanctioned', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    UNDER_IMPLEMENTATION: { label: 'Under Implementation', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    INSPECTION_REQUIRED: { label: 'Inspection Required', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
    ON_HOLD: { label: 'On Hold', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-500' },
    VERIFIED: { label: 'Verified', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-500' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    FINANCIALLY_CLOSED: { label: 'Financially Closed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
    REJECTED: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400' },
  };

  const config = configs[status] || {
    label: status ? String(status).replace(/_/g, ' ') : 'Pending',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

/**
 * 7. Card Primitive
 */
export function Card({ children, className = '', header, footer, padding = 'normal' }) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    normal: 'p-5',
    lg: 'p-6',
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow ${className}`}>
      {header && <div className="px-5 py-4 border-b border-slate-100">{header}</div>}
      <div className={paddingClasses[padding] || paddingClasses.normal}>{children}</div>
      {footer && <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl">{footer}</div>}
    </div>
  );
}
