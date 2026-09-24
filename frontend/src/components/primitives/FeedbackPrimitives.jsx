import React, { useEffect } from 'react';
import { Button } from './CorePrimitives.jsx';

/**
 * 8. Modal Primitive (Accessible focus-trapped dialog)
 */
export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all z-10`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {footer && <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * 9. Drawer Primitive (Slide-out inspection / audit details)
 */
export function Drawer({ isOpen, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${width} bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 transition-transform`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1" aria-label="Close drawer">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * 10. Tooltip Primitive
 */
export function Tooltip({ text, children, position = 'top' }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        role="tooltip"
        className="absolute z-30 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2.5 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-md whitespace-nowrap pointer-events-none -top-8 left-1/2 -translate-x-1/2"
      >
        {text}
      </div>
    </div>
  );
}

/**
 * 23. EmptyState Primitive
 */
export function EmptyState({
  icon = 'inbox',
  title = 'No records found',
  description = 'No matching information is available for the selected filters.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * 24. LoadingState & ErrorState Primitives
 */
export function LoadingState({ message = 'Loading statutory records...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-8 h-8 border-2 border-[#1F497D] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorState({ error = 'Failed to load records.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-xl border border-red-200">
      <span className="material-symbols-outlined text-red-500 mb-2" style={{ fontSize: 28 }}>error</span>
      <h4 className="text-sm font-semibold text-red-900 mb-1">Operational Error</h4>
      <p className="text-xs text-red-600 max-w-sm mb-4">{error}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry Request
        </Button>
      )}
    </div>
  );
}
