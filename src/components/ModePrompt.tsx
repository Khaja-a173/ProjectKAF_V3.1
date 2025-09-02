// src/components/ModePrompt.tsx
import React from 'react';
import type { Mode } from '../state/cartStore';

type Props = {
  open: boolean;
  hasTableSession: boolean; // true when user is at a table (joined)
  onSelect: (mode: Mode) => void;
  onClose: () => void;
};

export default function ModePrompt({ open, hasTableSession, onSelect, onClose }: Props) {
  if (!open) return null;
  return (
    <div style={backdrop}>
      <div style={modal}>
        <h3 style={{ margin: 0 }}>How would you like to order?</h3>
        <p style={{ marginTop: 8 }}>Choose a mode to start your cart.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button aria-label="choose-takeaway" onClick={() => onSelect('takeaway')} style={btn}>Takeaway</button>
          <button
            aria-label="choose-dinein"
            onClick={() => hasTableSession ? onSelect('table') : undefined}
            disabled={!hasTableSession}
            style={{ ...btn, opacity: hasTableSession ? 1 : 0.5 }}
            title={hasTableSession ? '' : 'Scan table QR to enable dine-in'}
          >
            Dine-in (Table)
          </button>
        </div>
        <button onClick={onClose} style={{ ...btn, marginTop: 12 }}>Close</button>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
};
const modal: React.CSSProperties = {
  background: '#fff', padding: 16, borderRadius: 12, width: 320, boxShadow: '0 10px 24px rgba(0,0,0,0.15)'
};
const btn: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f7f7f7', cursor: 'pointer'
};