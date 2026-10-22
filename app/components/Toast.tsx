'use client';
/**
 * TOAST NOTIFICATION COMPONENT
 *
 * Professional non-blocking notifications
 *
 * Features:
 * - Slide-in animation from top
 * - Auto-dismiss after duration
 * - Success/Error/Info types
 * - Optional action button
 * - Accessible (aria-live)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number; // ms, default 3000
  onClose: () => void;
  action?: ToastAction;
}

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  action
}: ToastProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick();
    } else if (action?.href) {
      router.push(action.href);
    }
    onClose();
  };

  const colors = {
    success: {
      bg: 'rgba(16, 185, 129, 0.95)', // green-500
      border: '#10b981',
      icon: '✓'
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.95)', // red-500
      border: '#ef4444',
      icon: '✕'
    },
    info: {
      bg: 'rgba(212, 175, 55, 0.95)', // gold
      border: '#D4AF37',
      icon: 'ℹ'
    }
  };

  const theme = colors[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: isMobile ? '1rem' : '2rem',
        right: isMobile ? '1rem' : '2rem',
        left: isMobile ? '1rem' : 'auto',
        zIndex: 9999,
        maxWidth: isMobile ? 'calc(100% - 2rem)' : '400px',
        minWidth: isMobile ? 'auto' : '320px',
        background: theme.bg,
        border: `2px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        animation: 'slideInFromTop 0.3s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      {/* Icon */}
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#fff',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {theme.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          color: '#fff',
          fontSize: '0.95rem',
          fontWeight: 600,
          lineHeight: '1.4'
        }}>
          {message}
        </p>

        {/* Action Button */}
        {action && (
          <button
            onClick={handleAction}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '0.25rem',
          lineHeight: 1,
          opacity: 0.7,
          transition: 'opacity 0.2s',
          flexShrink: 0
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
      >
        ×
      </button>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideInFromTop {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
