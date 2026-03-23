import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, ChevronRight, X } from 'lucide-react';
import type { SettingsGuide, StepScreen, MockupItem } from '@/lib/settingsGuides';

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: on ? '#7B61FF' : '#555',
        position: 'relative', transition: 'background 0.3s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </div>
  );
}

function Slider({ value, highlighted }: { value: number; highlighted: boolean }) {
  return (
    <div style={{ padding: '6px 12px' }}>
      <div style={{
        height: 4, borderRadius: 2, background: '#333',
        position: 'relative', overflow: 'visible',
        boxShadow: highlighted ? '0 0 0 2px #7B61FF44' : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{
          height: '100%', width: `${value * 100}%`,
          background: highlighted ? '#7B61FF' : '#888',
          borderRadius: 2, transition: 'background 0.3s',
        }} />
        <div style={{
          position: 'absolute', top: -7, left: `${value * 100}%`,
          transform: 'translateX(-50%)',
          width: 18, height: 18, borderRadius: '50%',
          background: highlighted ? '#7B61FF' : '#888',
          boxShadow: highlighted ? '0 0 0 4px #7B61FF33' : 'none',
          transition: 'all 0.3s',
        }} />
      </div>
    </div>
  );
}

function SettingsItem({ item, isHighlighted, delay }: { item: MockupItem; isHighlighted: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px',
        background: isHighlighted ? 'rgba(123, 97, 255, 0.18)' : 'transparent',
        borderRadius: 8,
        border: isHighlighted ? '1px solid rgba(123,97,255,0.4)' : '1px solid transparent',
        transition: 'all 0.3s',
        cursor: 'default',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, color: isHighlighted ? '#CCC8FF' : '#E0E0E0',
          fontWeight: isHighlighted ? 600 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.label}
        </div>
        {item.detail && (
          <div style={{ fontSize: 10, color: '#888', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.detail}
          </div>
        )}
      </div>
      {item.hasToggle && <Toggle on={!!item.toggleOn} />}
      {item.hasArrow && !item.hasToggle && (
        <ChevronRight size={14} color={isHighlighted ? '#7B61FF' : '#666'} style={{ flexShrink: 0 }} />
      )}
    </motion.div>
  );
}

function ScreenView({ screen }: { screen: StepScreen }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', background: '#121212',
      overflow: 'hidden',
    }}>
      {/* Screen title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px 6px',
        background: '#1A1A1A',
        borderBottom: '1px solid #2A2A2A',
      }}>
        {screen.showBack && (
          <ChevronLeft size={18} color="#7B61FF" style={{ flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#E0E0E0', flex: 1 }}>{screen.title}</span>
        {screen.showSearch && <Search size={15} color="#888" style={{ flexShrink: 0 }} />}
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {screen.items.map((item, idx) => (
          <div key={idx}>
            <SettingsItem item={item} isHighlighted={!!item.isHighlighted} delay={idx * 0.05} />
            {screen.hasSlider && idx === screen.highlightedIndex && (
              <Slider value={screen.sliderValue ?? 0.5} highlighted={!!screen.sliderHighlighted} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface VisualGuideProps {
  guide: SettingsGuide;
  onClose: () => void;
}

export function VisualGuide({ guide, onClose }: VisualGuideProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStepIndex(0);
  }, [guide]);

  // Auto-advance every 3 seconds
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setStepIndex(prev => (prev + 1) % guide.steps.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [guide.steps.length]);

  const goNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(1);
    setStepIndex(prev => (prev + 1) % guide.steps.length);
  };

  const goPrev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(-1);
    setStepIndex(prev => (prev - 1 + guide.steps.length) % guide.steps.length);
  };

  const currentStep = guide.steps[stepIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      style={{
        margin: '0 8px 8px',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#1E1E2E',
        border: '1px solid rgba(123,97,255,0.35)',
        boxShadow: '0 4px 24px rgba(123,97,255,0.15)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'rgba(123,97,255,0.12)',
        borderBottom: '1px solid rgba(123,97,255,0.2)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#B8A9FF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          📱 Visual Guide
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#888' }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '10px 12px' }}>
        {/* Mini phone mockup */}
        <div style={{
          width: 110, height: 190, borderRadius: 14,
          background: '#0D0D0D',
          border: '2px solid #333',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Phone status bar */}
          <div style={{
            height: 14, background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 6px', flexShrink: 0,
          }}>
            <span style={{ fontSize: 7, color: '#999' }}>9:41</span>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <span style={{ fontSize: 7 }}>📶</span>
              <span style={{ fontSize: 7 }}>🔋</span>
            </div>
          </div>

          {/* Screen content with animation */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={stepIndex}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d * 60, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -60, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
              >
                <ScreenView screen={currentStep} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Phone nav bar */}
          <div style={{
            height: 14, background: '#111', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, border: '1.5px solid #444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #444' }} />
            <div style={{ width: 10, height: 10, borderRadius: 1, border: '1.5px solid #444' }} />
          </div>
        </div>

        {/* Caption + controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7B61FF', marginBottom: 4 }}>
              Step {stepIndex + 1} of {guide.steps.length}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 11.5, color: '#C0C0D0', lineHeight: 1.5, margin: 0 }}
              >
                {currentStep.caption}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Step dots + nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {guide.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setStepIndex(i); setDirection(i > stepIndex ? 1 : -1); }}
                  style={{
                    width: i === stepIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === stepIndex ? '#7B61FF' : '#444',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={goPrev} style={{ background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.3)', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7B61FF' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={goNext} style={{ background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.3)', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7B61FF' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
