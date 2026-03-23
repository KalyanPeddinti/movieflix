import { PhoneFrame } from '@/components/PhoneFrame';
import { ChatInterface } from '@/components/ChatInterface';

export default function SimulatorPage() {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}images/desktop-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay to ensure contrast and moodiness */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      {/* Subtle radial gradient behind the phone for highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* The Simulator */}
      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <PhoneFrame>
          <ChatInterface />
        </PhoneFrame>
      </div>
      
      {/* Contextual helper text on desktop */}
      <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none">
        <p className="text-white/40 text-sm font-medium tracking-wide shadow-black drop-shadow-md">
          PhoneAssist Android Simulator • Interactive Preview
        </p>
      </div>
    </div>
  );
}
