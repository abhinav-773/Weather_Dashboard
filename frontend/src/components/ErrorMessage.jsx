/**
 * components/ErrorMessage.jsx
 * Displays a user-friendly error card with an optional retry action.
 */

/**
 * @param {{ message: string, onRetry?: () => void, onDismiss?: () => void, className?: string }} props
 */
export default function ErrorMessage({ message, onRetry, onDismiss, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`glass-card border border-red-400/30 bg-red-500/10 p-4 flex items-start gap-3 animate-fade-in ${className}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      {/* Message */}
      <p className="flex-1 text-sm text-slate-700 dark:text-white/90 leading-relaxed">{message}</p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white underline underline-offset-2 transition-colors"
          >
            Try Again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
