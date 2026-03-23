import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

interface ConflictCardProps {
  detectedDevice: string;
  mentionedDevice: string;
  onUseDetected: () => void;
  onUseMentioned: () => void;
}

export function ConflictCard({ detectedDevice, mentionedDevice, onUseDetected, onUseMentioned }: ConflictCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      style={{
        margin: '0 8px 8px',
        borderRadius: 16,
        background: '#1E1E2E',
        border: '1px solid rgba(255, 180, 50, 0.4)',
        boxShadow: '0 4px 20px rgba(255,180,50,0.1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div style={{
        padding: '10px 14px',
        background: 'rgba(255,180,50,0.1)',
        borderBottom: '1px solid rgba(255,180,50,0.2)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Smartphone size={14} color="#FFB432" />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#FFB432', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Different phone mentioned
        </span>
      </div>

      <div style={{ padding: '10px 14px 12px' }}>
        <p style={{ fontSize: 12, color: '#C0C0D0', margin: '0 0 10px', lineHeight: 1.5 }}>
          You mentioned a <strong style={{ color: '#FFB432' }}>{mentionedDevice}</strong> but I detected your phone as a{' '}
          <strong style={{ color: '#B8A9FF' }}>{detectedDevice}</strong>. Which instructions should I give?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onUseDetected}
            style={{
              flex: 1, padding: '8px 12px',
              background: 'rgba(123,97,255,0.15)',
              border: '1px solid rgba(123,97,255,0.4)',
              borderRadius: 10, cursor: 'pointer',
              fontSize: 11.5, color: '#B8A9FF', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            My {detectedDevice}
          </button>
          <button
            onClick={onUseMentioned}
            style={{
              flex: 1, padding: '8px 12px',
              background: 'rgba(255,180,50,0.12)',
              border: '1px solid rgba(255,180,50,0.4)',
              borderRadius: 10, cursor: 'pointer',
              fontSize: 11.5, color: '#FFB432', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            The {mentionedDevice}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
