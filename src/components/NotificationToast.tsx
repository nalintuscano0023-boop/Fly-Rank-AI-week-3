import React from 'react';
import { Heart, Check, X } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  const isFavorited = message.includes('Saved');

  return (
    <div className="toast-notification-wrapper" role="status" aria-live="polite">
      <div className="toast-notification-card">
        {isFavorited ? (
          <Heart size={18} className="toast-icon-favorited" fill="#ef4444" color="#ef4444" />
        ) : (
          <Check size={18} className="toast-icon-check" />
        )}
        <span className="toast-message">{message}</span>
        <button
          type="button"
          className="toast-dismiss-btn"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
