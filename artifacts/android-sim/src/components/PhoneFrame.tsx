import { ReactNode } from 'react';
import { StatusBar } from './StatusBar';
import { NavigationBar } from './NavigationBar';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative w-[390px] h-[820px] rounded-[60px] border-[12px] border-[#2A2A2D] bg-[#111] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_0_2px_rgba(255,255,255,0.05),0_0_0_1px_rgba(0,0,0,0.5)] flex flex-col transform transition-transform duration-500 hover:scale-[1.01]">
      
      {/* Side Buttons (Hardware) */}
      <div className="absolute -left-[14px] top-[160px] w-[3px] h-[50px] bg-[#1A1A1C] rounded-l-md shadow-[-1px_0_2px_rgba(255,255,255,0.1)]" />
      <div className="absolute -left-[14px] top-[220px] w-[3px] h-[90px] bg-[#1A1A1C] rounded-l-md shadow-[-1px_0_2px_rgba(255,255,255,0.1)]" />
      <div className="absolute -right-[14px] top-[240px] w-[3px] h-[60px] bg-[#1A1A1C] rounded-r-md shadow-[1px_0_2px_rgba(255,255,255,0.1)]" />

      {/* Screen Area */}
      <div className="relative w-full h-full bg-surface rounded-[48px] overflow-hidden flex flex-col">
        
        {/* Punch Hole Camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[18px] h-[18px] bg-black rounded-full z-50 border-[1.5px] border-[#1a1a1a] shadow-[inset_0_-2px_4px_rgba(255,255,255,0.1)]" />
        
        <StatusBar />
        
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </div>
        
        <NavigationBar />
      </div>
    </div>
  );
}
