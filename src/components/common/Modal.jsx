import { useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'

function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
}) {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  const handleEscape = useCallback(
    (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  const handleOverlayClick = useCallback(
    (e) => {
      if (closeOnOverlay && e.target === e.currentTarget) {
        onClose()
      }
    },
    [closeOnOverlay, onClose]
  )

  const trapFocus = useCallback((e) => {
    if (!modalRef.current) return

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusableElements = modalRef.current.querySelectorAll(focusableSelectors)

    if (focusableElements.length === 0) return

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', trapFocus)
      document.body.style.overflow = 'hidden'

      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusableSelectors =
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          const firstFocusable = modalRef.current.querySelector(focusableSelectors)
          if (firstFocusable) {
            firstFocusable.focus()
          }
        }
      }, 0)

      return () => {
        clearTimeout(timer)
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', trapFocus)
        document.body.style.overflow = ''
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          previousActiveElement.current.focus()
        }
      }
    }
  }, [isOpen, handleEscape, trapFocus])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`${sizeClasses[size] || sizeClasses.md} w-full bg-white rounded-xl shadow-card animate-slide-up mx-4`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          {title && (
            <h2
              id="modal-title"
              className="text-lg font-semibold text-surface-900 font-sans"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {children}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled || false}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  action.variant === 'primary'
                    ? 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    : action.variant === 'danger'
                      ? 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-surface-100 text-surface-700 hover:bg-surface-200 focus:ring-surface-400 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
      disabled: PropTypes.bool,
    })
  ),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeOnOverlay: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
}

export default Modal