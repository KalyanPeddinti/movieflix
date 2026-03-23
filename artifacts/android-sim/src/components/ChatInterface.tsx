import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, MoreVertical, Settings, X } from 'lucide-react';
import { format } from 'date-fns';
import { useChat, useVoiceInput, type SupportedLanguage, type DevicePayload } from '@/hooks/use-chat';
import { TOPIC_LABELS } from '@/lib/settingsGuides';
import { VisualGuide } from './VisualGuide';
import { ConflictCard } from './ConflictCard';
import clsx from 'clsx';

const QUICK_ACTIONS = [
  'Connect Bluetooth',
  'Change Wi-Fi',
  'Adjust Volume',
  'Adjust Brightness',
  'Do Not Disturb',
  'Battery Saver',
];

// Android settings deep link intents (simulated — shows an alert in web)
const SETTINGS_INTENTS: Record<string, string> = {
  bluetooth: 'android.settings.BLUETOOTH_SETTINGS',
  wifi: 'android.settings.WIFI_SETTINGS',
  volume: 'android.settings.SOUND_SETTINGS',
  brightness: 'android.settings.DISPLAY_SETTINGS',
  silent: 'android.settings.DO_NOT_DISTURB_SETTINGS',
  battery: 'android.settings.BATTERY_SAVER_SETTINGS',
  rotate: 'android.settings.DISPLAY_SETTINGS',
};

function OpenSettingsButton({ topic }: { topic: string }) {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    setOpened(true);
    setTimeout(() => setOpened(false), 2000);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleOpen}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: opened ? 'rgba(123,97,255,0.25)' : 'rgba(123,97,255,0.12)',
        border: '1px solid rgba(123,97,255,0.4)',
        borderRadius: 20, padding: '6px 14px',
        cursor: 'pointer', color: '#B8A9FF',
        fontSize: 12, fontWeight: 600,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      <Settings size={13} />
      {opened ? '✓ Settings opened!' : `Open ${TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? 'Settings'}`}
    </motion.button>
  );
}

export function ChatInterface({ devicePayload }: { devicePayload: DevicePayload }) {
  const {
    messages,
    sendMessage,
    isStreaming,
    isInitializing,
    isTranslating,
    language,
    setLanguage,
    pendingConflict,
    resolveConflict,
    dismissConflict,
    settingTopic,
    settingsGuide,
    effectiveUiStyle,
    detectedDevice,
  } = useChat({ devicePayload });

  const [inputValue, setInputValue] = useState('');
  const [guideVisible, setGuideVisible] = useState(true);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isListening, isAvailable: voiceAvailable, startListening, stopListening } = useVoiceInput(language);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingConflict]);

  // Show guide when topic first detected
  useEffect(() => {
    if (settingTopic && settingTopic !== prevTopic) {
      setGuideVisible(true);
      setPrevTopic(settingTopic);
    }
  }, [settingTopic, prevTopic]);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    if (isStreaming) return;
    sendMessage(action);
    setInputValue('');
  };

  const handleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setInputValue('');
      startListening((text) => {
        setInputValue(text);
        inputRef.current?.focus();
      });
    }
  };

  const uiStyleLabel = effectiveUiStyle === 'ios'
    ? 'iPhone'
    : effectiveUiStyle === 'samsung'
    ? 'Samsung One UI'
    : effectiveUiStyle === 'pixel'
    ? 'Google Pixel'
    : 'Android';

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#111118', position: 'relative' }}>

      {/* Top App Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px 6px',
        background: '#1A1A28',
        borderBottom: '1px solid rgba(123,97,255,0.15)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7B61FF, #4A38D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>📱</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E8E3FF', lineHeight: 1.2 }}>PhoneAssist</div>
            <div style={{ fontSize: 10, color: '#7B61FF', lineHeight: 1.3 }}>
              {detectedDevice} · {uiStyleLabel}
            </div>
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#666' }}>
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Language Toggle */}
      <div style={{
        padding: '8px 14px',
        background: '#1A1A28',
        borderBottom: '1px solid rgba(123,97,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 2 }}>
          {(['en', 'hi', 'te'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '4px 12px', borderRadius: 16,
                border: 'none', cursor: 'pointer',
                fontSize: 11.5, fontWeight: 600,
                background: language === lang ? '#7B61FF' : 'transparent',
                color: language === lang ? '#fff' : '#888',
                transition: 'all 0.25s',
              }}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'తెలుగు'}
            </button>
          ))}
        </div>

        {isTranslating && (
          <span style={{ fontSize: 10, color: '#7B61FF', opacity: 0.8 }}>Translating…</span>
        )}

        {/* Action bar: Open Settings button when topic detected */}
        {settingTopic && !isTranslating && (
          <OpenSettingsButton topic={settingTopic} />
        )}
      </div>

      {/* Chat + Visual Guide area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Visual Guide (pinned below language bar, inside scroll) */}
        <AnimatePresence>
          {settingsGuide && guideVisible && (
            <div style={{ padding: '8px 0 0' }}>
              <VisualGuide
                guide={settingsGuide}
                onClose={() => setGuideVisible(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Show guide restore button if dismissed */}
        <AnimatePresence>
          {settingsGuide && !guideVisible && (
            <motion.button
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setGuideVisible(true)}
              style={{
                margin: '8px 10px 0',
                padding: '6px 12px',
                background: 'rgba(123,97,255,0.1)',
                border: '1px solid rgba(123,97,255,0.25)',
                borderRadius: 10, cursor: 'pointer',
                fontSize: 11, color: '#7B61FF', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
                flexShrink: 0,
              }}
            >
              📱 Show visual guide for {TOPIC_LABELS[settingTopic!]}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat messages */}
        <div style={{ padding: '10px 10px 80px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isInitializing ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B61FF' }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '87%',
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isUser
                          ? 'linear-gradient(135deg, #7B61FF, #5A44CC)'
                          : '#23233A',
                        color: isUser ? '#fff' : '#D8D4F0',
                        fontSize: 13.5, lineHeight: 1.55,
                        boxShadow: isUser ? '0 2px 12px rgba(123,97,255,0.3)' : '0 1px 4px rgba(0,0,0,0.3)',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}>
                        {msg.content || (
                          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: 18 }}>
                            {[0, 0.2, 0.4].map((delay, i) => (
                              <motion.span
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay }}
                                style={{ width: 6, height: 6, borderRadius: '50%', background: '#7B61FF', display: 'inline-block' }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 9.5, color: '#555', marginTop: 3, paddingInline: 4 }}>
                        {format(msg.createdAt, 'h:mm a')}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Conflict card */}
              <AnimatePresence>
                {pendingConflict && (
                  <ConflictCard
                    detectedDevice={detectedDevice}
                    mentionedDevice={pendingConflict.mentionedLabel}
                    onUseDetected={() => resolveConflict('pixel')}
                    onUseMentioned={() => resolveConflict(pendingConflict.mentionedStyle)}
                  />
                )}
              </AnimatePresence>

              {/* Quick action chips — show when no user messages yet */}
              {messages.filter(m => m.role === 'user').length === 0 && !isInitializing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ marginTop: 8 }}
                >
                  <p style={{ fontSize: 11, color: '#555', marginBottom: 8, marginLeft: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Quick suggestions
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {QUICK_ACTIONS.map(action => (
                      <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        style={{
                          padding: '7px 13px',
                          borderRadius: 14,
                          border: '1px solid rgba(123,97,255,0.35)',
                          background: 'rgba(123,97,255,0.08)',
                          color: '#B8A9FF', fontSize: 12, fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input Area — floated at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '8px 10px 10px',
        background: 'linear-gradient(to top, #111118 80%, transparent)',
        flexShrink: 0,
      }}>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', fontSize: 11, color: '#FF6B6B',
              marginBottom: 6, fontWeight: 600,
            }}
          >
            🎙️ Listening… tap mic to stop
          </motion.div>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#1E1E30',
          borderRadius: 24, padding: '4px 4px 4px 10px',
          border: '1px solid rgba(123,97,255,0.25)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          <button
            onClick={handleMic}
            style={{
              background: isListening ? 'rgba(255,107,107,0.15)' : 'none',
              border: 'none', cursor: voiceAvailable ? 'pointer' : 'not-allowed',
              padding: 6, borderRadius: '50%',
              color: isListening ? '#FF6B6B' : voiceAvailable ? '#7B61FF' : '#444',
              flexShrink: 0, opacity: voiceAvailable ? 1 : 0.4,
              transition: 'all 0.2s',
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening…' : 'Type or speak your question…'}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#E0DCF8', fontSize: 13.5,
            }}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              cursor: inputValue.trim() && !isStreaming ? 'pointer' : 'not-allowed',
              background: inputValue.trim() && !isStreaming
                ? 'linear-gradient(135deg, #7B61FF, #5A44CC)'
                : 'rgba(255,255,255,0.06)',
              color: inputValue.trim() && !isStreaming ? '#fff' : '#444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.25s',
              boxShadow: inputValue.trim() && !isStreaming ? '0 2px 10px rgba(123,97,255,0.4)' : 'none',
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
