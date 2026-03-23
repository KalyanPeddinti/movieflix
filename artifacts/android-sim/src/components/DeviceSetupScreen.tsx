import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Smartphone, HelpCircle, ArrowRight } from 'lucide-react';

export interface DeviceData {
  model: string;
  manufacturer: string;
  osName: string;
  osVersion: string;
}

interface DeviceSetupScreenProps {
  onComplete: (device: DeviceData) => void;
}

const HOW_TO_FIND: { brand: string; emoji: string; steps: string[] }[] = [
  {
    brand: 'Samsung',
    emoji: '📱',
    steps: [
      'Open Settings',
      'Scroll down and tap "About phone"',
      'Tap "Software information"',
      'Look for "Android version" (e.g. 14)',
      'Go back — your model is shown at the top (e.g. Galaxy S24 Ultra)',
    ],
  },
  {
    brand: 'Google Pixel',
    emoji: '🔵',
    steps: [
      'Open Settings',
      'Scroll down and tap "About phone"',
      'Your model is at the top (e.g. Pixel 8 Pro)',
      'Tap "Android version" to see the full version number',
    ],
  },
  {
    brand: 'iPhone',
    emoji: '🍎',
    steps: [
      'Open Settings',
      'Tap "General"',
      'Tap "About"',
      'Look for "Model Name" (e.g. iPhone 15 Pro)',
      'Look for "iOS Version" (e.g. 17.3)',
    ],
  },
  {
    brand: 'Other Android (OnePlus, Xiaomi, Oppo, Vivo, Motorola…)',
    emoji: '🤖',
    steps: [
      'Open Settings',
      'Scroll down and tap "About phone" or "About device"',
      'Your model name is shown at the top',
      'Look for "Android version" — it may be under "Software info"',
    ],
  },
];

function HowToFindPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#7B61FF', fontSize: 12.5, fontWeight: 600, padding: 0,
        }}
      >
        <HelpCircle size={14} />
        How do I find my device model and OS version?
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden', marginTop: 10 }}
          >
            <div style={{
              background: 'rgba(123,97,255,0.07)',
              border: '1px solid rgba(123,97,255,0.2)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              {/* Brand tabs */}
              <div style={{
                display: 'flex', overflowX: 'auto', borderBottom: '1px solid rgba(123,97,255,0.15)',
                background: 'rgba(0,0,0,0.2)',
              }}>
                {HOW_TO_FIND.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    style={{
                      padding: '8px 12px', border: 'none', cursor: 'pointer',
                      background: activeTab === i ? 'rgba(123,97,255,0.2)' : 'transparent',
                      color: activeTab === i ? '#B8A9FF' : '#666',
                      fontSize: 11.5, fontWeight: activeTab === i ? 700 : 400,
                      whiteSpace: 'nowrap', flexShrink: 0,
                      borderBottom: activeTab === i ? '2px solid #7B61FF' : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {h.emoji} {h.brand.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Steps */}
              <div style={{ padding: '12px 14px' }}>
                <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {HOW_TO_FIND[activeTab].steps.map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(123,97,255,0.25)', border: '1px solid rgba(123,97,255,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#B8A9FF',
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 12.5, color: '#C0C0D0', lineHeight: 1.5, paddingTop: 1 }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function inferManufacturerFromModel(model: string): string {
  const t = model.toLowerCase();
  if (t.includes('samsung') || t.includes('galaxy')) return 'Samsung';
  if (t.includes('pixel') || t.includes('google')) return 'Google';
  if (t.includes('iphone') || t.includes('ipad') || t.includes('apple')) return 'Apple';
  if (t.includes('oneplus') || t.includes('one plus')) return 'OnePlus';
  if (t.includes('motorola') || t.includes('moto')) return 'Motorola';
  if (t.includes('xiaomi') || t.includes('redmi') || t.includes('poco')) return 'Xiaomi';
  if (t.includes('oppo') || t.includes('reno') || t.includes('find x')) return 'Oppo';
  if (t.includes('realme')) return 'Realme';
  if (t.includes('vivo')) return 'Vivo';
  if (t.includes('nokia')) return 'Nokia';
  if (t.includes('xperia') || t.includes('sony')) return 'Sony';
  if (t.includes('huawei')) return 'Huawei';
  if (t.includes('honor')) return 'Honor';
  if (t.includes('nothing')) return 'Nothing';
  return 'Android';
}

function inferOsName(model: string): string {
  const t = model.toLowerCase();
  if (t.includes('iphone') || t.includes('ipad') || t.includes('ios')) return 'iOS';
  return 'Android';
}

export function DeviceSetupScreen({ onComplete }: DeviceSetupScreenProps) {
  const [model, setModel] = useState('');
  const [osVersion, setOsVersion] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    const trimmedModel = model.trim();
    const trimmedVersion = osVersion.trim();

    if (!trimmedModel) {
      setError('Please enter your phone model (e.g. Samsung Galaxy S24)');
      return;
    }
    if (!trimmedVersion) {
      setError('Please enter your OS version (e.g. 14 or 17.3)');
      return;
    }

    setError('');
    const osName = inferOsName(trimmedModel);
    const manufacturer = inferManufacturerFromModel(trimmedModel);

    onComplete({
      model: trimmedModel,
      manufacturer,
      osName,
      osVersion: trimmedVersion,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleStart();
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#111118', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px 10px',
        background: '#1A1A28',
        borderBottom: '1px solid rgba(123,97,255,0.15)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7B61FF, #4A38D4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>📱</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#E8E3FF', lineHeight: 1.2 }}>PhoneAssist</div>
          <div style={{ fontSize: 10, color: '#7B61FF' }}>Phone Settings Helper</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Icon + Heading */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px',
              background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Smartphone size={24} color="#7B61FF" />
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#E8E3FF' }}>
              Tell me about your phone
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#888', lineHeight: 1.5 }}>
              I couldn't auto-detect your device. Enter your phone details so I can give you accurate, step-by-step instructions.
            </p>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Phone model */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#B8A9FF', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Phone Model
              </label>
              <input
                type="text"
                value={model}
                onChange={e => { setModel(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Samsung Galaxy S24, iPhone 15, Pixel 8"
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#1E1E30', border: '1px solid rgba(123,97,255,0.3)',
                  borderRadius: 10, padding: '10px 12px',
                  color: '#E0DCF8', fontSize: 13,
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#7B61FF')}
                onBlur={e => (e.target.style.borderColor = 'rgba(123,97,255,0.3)')}
              />
            </div>

            {/* OS version */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#B8A9FF', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                OS Version
              </label>
              <input
                type="text"
                value={osVersion}
                onChange={e => { setOsVersion(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Android 14, iOS 17, One UI 6.1"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#1E1E30', border: '1px solid rgba(123,97,255,0.3)',
                  borderRadius: 10, padding: '10px 12px',
                  color: '#E0DCF8', fontSize: 13,
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#7B61FF')}
                onBlur={e => (e.target.style.borderColor = 'rgba(123,97,255,0.3)')}
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ margin: 0, fontSize: 12, color: '#FF6B6B', fontWeight: 500 }}
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* How to find help */}
            <HowToFindPanel />

            {/* Start button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              style={{
                marginTop: 8,
                width: '100%', padding: '13px',
                background: model.trim() && osVersion.trim()
                  ? 'linear-gradient(135deg, #7B61FF, #5A44CC)'
                  : 'rgba(123,97,255,0.2)',
                border: 'none', borderRadius: 12, cursor: 'pointer',
                color: model.trim() && osVersion.trim() ? '#fff' : '#555',
                fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: model.trim() && osVersion.trim() ? '0 4px 16px rgba(123,97,255,0.4)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              Start PhoneAssist
              <ArrowRight size={16} />
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#444', margin: 0 }}>
              Your device info is only used to give you accurate instructions
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
