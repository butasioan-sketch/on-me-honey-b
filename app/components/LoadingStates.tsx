'use client';
/**
 * LOADING & STATE COMPONENTS
 * Professional loading, error, and empty states
 */

// Spinner Component
export function Spinner({ size = 40, color = '#D4AF37' }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${size / 10}px solid rgba(255, 255, 255, 0.1)`,
        borderTop: `${size / 10}px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}

// Loading Card Skeleton
export function SkeletonCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        borderRadius: '12px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  );
}

// Error State
export function ErrorState({ 
  title = 'Etwas ist schiefgelaufen',
  message = 'Bitte versuche es später erneut.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#fff' }}>
        {title}
      </h3>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#D4AF37',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Erneut versuchen
        </button>
      )}
    </div>
  );
}

// Empty State
export function EmptyState({
  title = 'Keine Ergebnisse',
  message = 'Versuche einen anderen Filter.',
  icon = '🔍',
}: {
  title?: string;
  message?: string;
  icon?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#fff' }}>
        {title}
      </h3>
      <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
        {message}
      </p>
    </div>
  );
}

// Success Toast
export function SuccessToast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        background: 'rgba(34, 197, 94, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        color: '#fff',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        animation: 'slideIn 0.3s ease',
        zIndex: 9999,
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>✓</span>
      <span>{message}</span>
    </div>
  );
}

// Global animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}
