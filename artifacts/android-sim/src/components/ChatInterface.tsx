import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, MoreVertical, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useChat, SupportedLanguage, Message } from '@/hooks/use-chat';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const QUICK_ACTIONS = [
  "Connect Bluetooth",
  "Change Wi-Fi",
  "Adjust Volume",
  "Increase Brightness"
];

export function ChatInterface() {
  const { messages, sendMessage, isStreaming, isInitializing, language, setLanguage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

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
    setInputValue(action);
    sendMessage(action);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-hidden">
      {/* Top App Bar */}
      <div className="px-4 py-3 flex items-center justify-between bg-surface z-10 border-b border-surface-container-high/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}images/ai-avatar.png`} alt="PhoneAssist" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-display font-medium text-foreground leading-tight">PhoneAssist</h1>
            <p className="text-[10px] text-primary opacity-80">Device recognized: Pixel 8</p>
          </div>
        </div>
        <button className="p-2 -mr-2 rounded-full hover:bg-surface-container transition-colors text-on-surface">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Language Toggle */}
      <div className="px-4 py-2 bg-surface flex justify-center border-b border-surface-container-high/30 shadow-sm z-10">
        <div className="flex bg-surface-container rounded-full p-1 w-full max-w-[240px]">
          {(['en', 'hi', 'te'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "flex-1 text-xs font-medium py-1.5 rounded-full transition-all duration-300",
                language === lang 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-outline hover:text-foreground"
              )}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'తెలుగు'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 scroll-smooth pb-32"
      >
        {isInitializing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-1.5">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-primary" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    isUser ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-[24px] text-[15px] leading-relaxed",
                    isUser 
                      ? "bg-primary-container text-on-primary-container rounded-br-[6px]" 
                      : "bg-surface-container-high text-foreground rounded-bl-[6px]"
                  )}>
                    {msg.content || (
                       <span className="inline-flex gap-1 items-center h-5">
                         <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                         <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                         <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                       </span>
                    )}
                  </div>
                  <span className="text-[10px] text-outline mt-1 px-1">
                    {format(msg.createdAt, 'h:mm a')}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {messages.length <= 1 && !isInitializing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 self-center w-full"
          >
            <p className="text-xs text-outline mb-3 ml-2 font-medium">Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-sm text-secondary hover:bg-surface-container transition-colors shadow-sm active:scale-95"
                >
                  {action}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-12 left-0 right-0 p-4 bg-gradient-to-t from-surface via-surface to-transparent pt-10">
        <div className="relative flex items-center bg-surface-container-high rounded-full p-1.5 shadow-lg ring-1 ring-white/5">
          <button className="p-3 text-outline hover:text-primary transition-colors rounded-full shrink-0">
            <Mic size={22} />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or speak..."
            className="flex-1 bg-transparent border-none text-foreground placeholder:text-outline text-[15px] px-2"
          />
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            className={cn(
              "p-3 rounded-full transition-all duration-300 shrink-0",
              inputValue.trim() && !isStreaming
                ? "bg-primary text-on-primary shadow-md hover:brightness-110 active:scale-95"
                : "bg-surface-container text-outline opacity-50 cursor-not-allowed"
            )}
          >
            <Send size={18} className={cn(inputValue.trim() && !isStreaming && "translate-x-[1px] -translate-y-[1px]")} />
          </button>
        </div>
      </div>
    </div>
  );
}
