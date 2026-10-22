'use client';
/**
 * VIEW CONTROLS - Multi-angle showcase
 * Professional camera position switching
 */

import { useState } from 'react';

interface ViewControlsProps {
  onViewChange: (view: 'front' | 'back' | 'left' | 'right') => void;
  currentView?: string;
}

export default function ViewControls({ onViewChange, currentView = 'front' }: ViewControlsProps) {
  const views = [
    { id: 'front', label: 'Front', icon: '⬆️' },
    { id: 'back', label: 'Back', icon: '⬇️' },
    { id: 'left', label: 'Links', icon: '⬅️' },
    { id: 'right', label: 'Rechts', icon: '➡️' },
  ] as const;

  return (
    <div style={{
      position: 'absolute',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem',
      padding: '0.75rem',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      zIndex: 10,
    }}>
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          style={{
            padding: '0.5rem 1rem',
            background: currentView === view.id ? 'rgba(212, 175, 55, 0.9)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            color: currentView === view.id ? '#000' : '#fff',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: currentView === view.id ? '600' : '400',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
          onMouseEnter={(e) => {
            if (currentView !== view.id) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== view.id) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }
          }}
        >
          <span>{view.icon}</span>
          <span>{view.label}</span>
        </button>
      ))}
    </div>
  );
}
