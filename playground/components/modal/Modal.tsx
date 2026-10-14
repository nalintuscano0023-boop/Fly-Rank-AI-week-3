import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import './modal.css';

export interface ModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** Callback fired when the modal requests to close (via Escape, backdrop, or close button) */
  onClose: () => void;
  /** Dialog title rendered in the header and linked via aria-labelledby */
  title?: React.ReactNode;
  /** Optional descriptive subtitle or summary linked via aria-describedby */
  description?: React.ReactNode;
  /** Accessible label string if a visual title is not provided */
  ariaLabel?: string;
  /** Dialog body content */
  children: React.ReactNode;
  /** Optional footer content (e.g. actions, buttons) */
  footer?: React.ReactNode;
  /** Optional ref of the element to focus immediately upon opening */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Whether clicking outside on the backdrop closes the modal (default: true) */
  closeOnBackdropClick?: boolean;
  /** Whether pressing the Escape key closes the modal (default: true) */
  closeOnEscape?: boolean;
  /** Custom CSS class name for the dialog container */
  className?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Helper to get all keyboard-focusable elements inside a container.
 * Filters out hidden or non-displayed elements.
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    // In JSDOM / test environments, offsetParent may be undefined for visible elements.
    // Check computed styles and hidden attributes.
    if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

/**
 * Accessible Modal Dialog Component built from scratch following W3C WAI-ARIA APG.
 * Features:
 * - Proper dialog semantics (`role="dialog"`, `aria-modal="true"`)
 * - Accessible labeling (`aria-labelledby`, `aria-describedby`, or `aria-label`)
 * - Keyboard & mouse open/close
 * - Escape key dismissal
 * - Focus entry to first interactive element (or initialFocusRef)
 * - Complete focus trap (Tab / Shift+Tab cycling and focusin guard)
 * - Focus restoration to the trigger element upon closing
 * - Body scroll locking and clean unmount lifecycle management
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  footer,
  initialFocusRef,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  const generatedId = useId();
  const titleId = title ? `modal-title-${generatedId}` : undefined;
  const descriptionId = description ? `modal-desc-${generatedId}` : undefined;

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Focus restoration & initial focus capture
  useEffect(() => {
    if (!isOpen) return;

    // Capture element focused before opening the dialog
    if (document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    // Lock body scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus inside dialog on next frame after mounting
    const frameId = requestAnimationFrame(() => {
      if (!dialogRef.current) return;

      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length > 0) {
        focusable[0]?.focus();
      } else {
        // Fallback: focus the dialog container itself
        dialogRef.current.focus();
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;

      // Restore focus to trigger element
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, initialFocusRef]);

  // Keyboard navigation & Focus trap listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      // Handle Tab key focus trapping
      if (event.key === 'Tab') {
        if (!dialogRef.current) return;

        const focusable = getFocusableElements(dialogRef.current);
        if (focusable.length === 0) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: moving backwards
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: moving forwards
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    // Prevent focus from escaping to outside elements (e.g. via accessibility tools or browser chrome)
    const handleFocusIn = (event: FocusEvent) => {
      if (!dialogRef.current) return;
      if (event.target instanceof Node && !dialogRef.current.contains(event.target)) {
        event.preventDefault();
        const focusable = getFocusableElements(dialogRef.current);
        if (focusable.length > 0) {
          focusable[0]?.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-label={!titleId ? ariaLabel : undefined}
        tabIndex={-1}
        className={`modal-container ${className}`.trim()}
        data-testid="modal-dialog"
      >
        <div className="modal-header">
          <div className="modal-titles">
            {title && (
              <h2 id={titleId} className="modal-title">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="modal-description">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close dialog"
            data-testid="modal-close-button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="modal-body" data-testid="modal-body">
          {children}
        </div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
