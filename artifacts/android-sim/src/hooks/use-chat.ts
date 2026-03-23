import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  detectTopic, detectUiStyleFromText,
  getGuideForDevice, type SettingTopic, type UiStyle, type SettingsGuide,
} from '@/lib/settingsGuides';

const API_BASE = window.location.origin + '/api';

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export type SupportedLanguage = 'en' | 'hi' | 'te';

const LANG_TO_LOCALE: Record<SupportedLanguage, string> = {
  en: 'en-US', hi: 'hi-IN', te: 'te-IN',
};

export interface DevicePayload {
  model: string;
  manufacturer: string;
  osName: string;
  osVersion: string;
}

// ─── device label extractor ────────────────────────────────────────────────────
function extractDeviceLabel(text: string, style: UiStyle): string {
  if (style === 'samsung') {
    const full = text.match(/samsung\s+galaxy\s+(?:s\d+|a\d+|m\d+|z\s*(?:fold|flip)\s*\d*|note\s*\d+)\s*(?:ultra|plus|\+|fe)?/i);
    if (full) return full[0].replace(/\s+/g, ' ').trim();
    const galaxy = text.match(/galaxy\s+(?:s\d+|a\d+|m\d+|z\s*(?:fold|flip)\s*\d*|note\s*\d+)\s*(?:ultra|plus|\+|fe)?/i);
    if (galaxy) return `Samsung ${galaxy[0].replace(/\s+/g, ' ').trim()}`;
    const short = text.match(/(?:s2[0-5]|z\s*(?:fold|flip)\s*\d*|note\s*(?:8|9|10|20))\s*(?:ultra|plus|\+|fe)?/i);
    if (short) return `Samsung Galaxy ${short[0].replace(/\s+/g, ' ').trim()}`;
    if (/galaxy/i.test(text)) return 'Samsung Galaxy';
    return 'Samsung Phone';
  }
  if (style === 'ios') {
    const iphone = text.match(/iphone\s+\d+\s*(?:pro\s*(?:max)?|plus|mini)?/i);
    if (iphone) return iphone[0].replace(/\s+/g, ' ').trim();
    return 'iPhone';
  }
  if (style === 'pixel') {
    const pixel = text.match(/(?:google\s+)?pixel\s+\d+[a-z]?\s*(?:pro\s*(?:xl)?|xl|a)?/i);
    if (pixel) return pixel[0].replace(/\s+/g, ' ').trim();
    return 'Google Pixel';
  }
  // android
  const patterns: [RegExp, string][] = [
    [/oneplus\s+\d+\s*(?:pro|ultra|t)?/i, 'OnePlus'],
    [/motorola\s+(?:edge|razr|moto)\s*[\w\s]*/i, 'Motorola'],
    [/moto\s+[gem]\s*\d+/i, 'Motorola'],
    [/xiaomi\s+\d+\s*(?:pro|ultra|t)?/i, 'Xiaomi'],
    [/redmi\s+(?:note\s+)?\d+/i, 'Xiaomi'],
    [/poco\s+[a-z]\d+/i, 'Xiaomi'],
    [/oppo\s+(?:reno|find\s*x|a|f)\s*[\w\s]*/i, 'Oppo'],
    [/realme\s+[\w\s]*/i, 'Realme'],
    [/vivo\s+[vyx]\d+/i, 'Vivo'],
    [/nokia\s+[gxc]?\d+/i, 'Nokia'],
    [/(?:sony\s+)?xperia\s+[\d\w]+/i, 'Sony'],
    [/asus\s+zenfone\s+\d+/i, 'ASUS'],
    [/nothing\s+phone\s+(?:\d+|two|one)/i, 'Nothing'],
    [/huawei\s+[pm]\d+/i, 'Huawei'],
    [/honor\s+\d+/i, 'Honor'],
    [/infinix\s+(?:note|hot|zero)\s*\d+/i, 'Infinix'],
    [/tecno\s+(?:camon|spark|pop)\s*\d+/i, 'Tecno'],
  ];
  for (const [re, brand] of patterns) {
    const m = text.match(re);
    if (m) return `${brand} ${m[0].replace(new RegExp(brand, 'i'), '').replace(/\s+/g, ' ').trim()}`.trim();
  }
  return 'Android Phone';
}

function inferManufacturer(label: string): string {
  const t = label.toLowerCase();
  if (t.includes('oneplus')) return 'OnePlus';
  if (t.includes('motorola') || /moto /.test(t)) return 'Motorola';
  if (t.includes('xiaomi') || t.includes('redmi') || t.includes('poco')) return 'Xiaomi';
  if (t.includes('oppo')) return 'Oppo';
  if (t.includes('realme')) return 'Realme';
  if (t.includes('vivo')) return 'Vivo';
  if (t.includes('nokia')) return 'Nokia';
  if (t.includes('sony') || t.includes('xperia')) return 'Sony';
  if (t.includes('asus') || t.includes('zenfone')) return 'ASUS';
  if (t.includes('nothing')) return 'Nothing';
  if (t.includes('huawei')) return 'Huawei';
  if (t.includes('honor')) return 'Honor';
  if (t.includes('infinix')) return 'Infinix';
  if (t.includes('tecno')) return 'Tecno';
  return 'Android';
}

function syntheticDevicePayload(style: UiStyle, label: string) {
  switch (style) {
    case 'samsung':
      return { model: label, manufacturer: 'Samsung', osName: 'Android', osVersion: '14' };
    case 'ios':
      return { model: label, manufacturer: 'Apple', osName: 'iOS', osVersion: '17' };
    case 'pixel':
      return { model: label, manufacturer: 'Google', osName: 'Android', osVersion: '14' };
    default: {
      const mfg = inferManufacturer(label);
      return { model: label, manufacturer: mfg, osName: 'Android', osVersion: '14' };
    }
  }
}

export interface PendingConflict {
  mentionedStyle: UiStyle;
  mentionedLabel: string;
  savedMessage: string;
}

// ─── Web Speech API voice input ───────────────────────────────────────────────
export function useVoiceInput(lang: SupportedLanguage) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isAvailable = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!isAvailable) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = LANG_TO_LOCALE[lang];
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) onResult(final.trim());
      else if (interim) onResult(interim.trim());
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isAvailable, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isAvailable, startListening, stopListening };
}

// ─── Main chat hook ────────────────────────────────────────────────────────────
export function useChat({
  initialLanguage = 'en' as SupportedLanguage,
  devicePayload,
}: {
  initialLanguage?: SupportedLanguage;
  devicePayload: DevicePayload;
}) {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);
  const [pendingConflict, setPendingConflict] = useState<PendingConflict | null>(null);

  // Track what UI style the user chose (after conflict resolution)
  const [chosenUiStyle, setChosenUiStyle] = useState<UiStyle | null>(null);
  // Default device is pixel/android
  const defaultUiStyle: UiStyle = 'pixel';

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize conversation
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API_BASE}/gemini/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Phone Settings Assistant',
            language: initialLanguage,
            initialPrompt: '',
            deviceInfo: devicePayload,
          }),
        });
        if (!res.ok) throw new Error('Failed to create conversation');
        const data = await res.json();
        setConversationId(data.id);
        setMessages([{
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: 'Hello! I am PhoneAssist. What phone setting would you like help with today? You can type, speak, or pick a suggestion below.',
          createdAt: new Date(),
        }]);
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, []);

  // ─── Translate all assistant messages when language changes ─────────────────
  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (lang === 'en') return; // skip translation to English (already in English)

    const assistantMsgs = messages.filter(m => m.role === 'assistant' && m.content.length > 0);
    if (assistantMsgs.length === 0) return;

    setIsTranslating(true);
    try {
      const res = await fetch(`${API_BASE}/gemini/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: assistantMsgs.map(m => m.content),
          targetLanguage: lang,
        }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      const translated: string[] = data.translations ?? [];

      setMessages(prev => {
        let idx = 0;
        return prev.map(m => {
          if (m.role === 'assistant') {
            const updated = { ...m, content: translated[idx] ?? m.content };
            idx++;
            return updated;
          }
          return m;
        });
      });
    } catch {
      // silently keep original if translation fails
    } finally {
      setIsTranslating(false);
    }
  }, [messages]);

  // ─── Core stream send ───────────────────────────────────────────────────────
  const doStreamSend = useCallback(async (
    content: string,
    activePayload: DevicePayload,
    isFirst: boolean,
  ) => {
    if (!conversationId) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const userMsg: Message = {
      id: `user-${Date.now()}`, role: 'user', content, createdAt: new Date(),
    };
    const assistantId = `assistant-${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantId, role: 'assistant', content: '', createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_BASE}/gemini/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ content, language, deviceInfo: activePayload }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.content) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + data.content } : m,
              ));
            }
            if (data.done) break;
          } catch { /* ignore parse errors */ }
        }
      }

      // Auto-title on first message
      if (isFirst) {
        const newTitle = content.slice(0, 40);
        await fetch(`${API_BASE}/gemini/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle }),
        }).catch(() => {});
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId && m.content === ''
            ? { ...m, content: 'Sorry, I had trouble responding. Please try again.' }
            : m,
        ));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [conversationId, language]);

  // ─── Send message (checks for device conflict first) ────────────────────────
  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isStreaming) return;

    // Conflict detection: does the user mention a different phone brand?
    const mentionedStyle = detectUiStyleFromText(trimmed);
    const effectiveUiStyle = chosenUiStyle ?? defaultUiStyle;

    if (mentionedStyle && mentionedStyle !== effectiveUiStyle && mentionedStyle !== chosenUiStyle) {
      const mentionedLabel = extractDeviceLabel(trimmed, mentionedStyle);
      setPendingConflict({ mentionedStyle, mentionedLabel, savedMessage: trimmed });
      return;
    }

    const payload = chosenUiStyle
      ? syntheticDevicePayload(chosenUiStyle, devicePayload.model)
      : devicePayload;

    await doStreamSend(trimmed, payload, messages.filter(m => m.role === 'user').length === 0);
  }, [isStreaming, chosenUiStyle, doStreamSend, messages]);

  // ─── Conflict resolution ────────────────────────────────────────────────────
  const resolveConflict = useCallback(async (resolvedStyle: UiStyle) => {
    if (!pendingConflict) return;
    const { mentionedStyle, mentionedLabel, savedMessage } = pendingConflict;
    setChosenUiStyle(resolvedStyle);
    setPendingConflict(null);

    const activePayload = resolvedStyle === defaultUiStyle
      ? devicePayload
      : syntheticDevicePayload(mentionedStyle, mentionedLabel);

    await doStreamSend(savedMessage, activePayload, messages.filter(m => m.role === 'user').length === 0);
  }, [pendingConflict, doStreamSend, messages]);

  const dismissConflict = useCallback(() => {
    setPendingConflict(null);
  }, []);

  // ─── Derive current settings topic from conversation ────────────────────────
  const settingTopic = useMemo<SettingTopic | null>(() => {
    // Scan user messages newest-first
    const userMsgs = messages.filter(m => m.role === 'user').reverse();
    for (const m of userMsgs) {
      const t = detectTopic(m.content);
      if (t) return t;
    }
    return null;
  }, [messages]);

  // ─── Visual guide for the current topic + effective UI style ────────────────
  const effectiveUiStyle: UiStyle = chosenUiStyle ?? defaultUiStyle;
  const settingsGuide = useMemo<SettingsGuide | null>(() => {
    if (!settingTopic) return null;
    return getGuideForDevice(settingTopic, effectiveUiStyle);
  }, [settingTopic, effectiveUiStyle]);

  return {
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
    detectedDevice: devicePayload.model,
    chosenUiStyle,
  };
}
