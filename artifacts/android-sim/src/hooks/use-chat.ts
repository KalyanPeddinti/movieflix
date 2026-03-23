import { useState, useRef, useCallback, useEffect } from 'react';

// Shared API base matching the requirement
const API_BASE = window.location.origin + '/api';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export type SupportedLanguage = 'en' | 'hi' | 'te';

interface UseChatOptions {
  initialLanguage?: SupportedLanguage;
}

export function useChat({ initialLanguage = 'en' }: UseChatOptions = {}) {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize a new conversation on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API_BASE}/gemini/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Phone Settings Assistant',
            language: initialLanguage,
            initialPrompt: 'Hello, I am ready to help you with your phone settings.',
            deviceInfo: {
              model: 'Google Pixel 8',
              manufacturer: 'Google',
              osName: 'Android',
              osVersion: '14'
            }
          })
        });
        
        if (!res.ok) throw new Error('Failed to create conversation');
        const data = await res.json();
        setConversationId(data.id);
        
        // Add a welcoming system/assistant message locally for better UX
        setMessages([{
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: 'Hello! I am PhoneAssist. What settings would you like help with today? You can type or pick a suggestion below.',
          createdAt: new Date()
        }]);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setIsInitializing(false);
      }
    }
    
    init();
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !conversationId) return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date()
    };

    const assistantMsgId = `assistant-${Date.now() + 1}`;
    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '', // Will be filled by stream
      createdAt: new Date()
    };

    // Optimistically add both messages
    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_BASE}/gemini/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ content, language }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(jsonStr);
              if (data.content) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMsgId 
                    ? { ...msg, content: msg.content + data.content } 
                    : msg
                ));
              }
              if (data.done) {
                // Stream complete signal from server
                break;
              }
            } catch (e) {
              console.warn('Failed to parse SSE JSON chunk:', jsonStr, e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId && msg.content === ''
            ? { ...msg, content: 'Sorry, I encountered an error connecting to the server.' }
            : msg
        ));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [conversationId, language]);

  return {
    messages,
    sendMessage,
    isStreaming,
    isInitializing,
    language,
    setLanguage
  };
}
