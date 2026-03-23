import { useState } from 'react';
import { PhoneFrame } from '@/components/PhoneFrame';
import { ChatInterface } from '@/components/ChatInterface';
import { DeviceSetupScreen, type DeviceData } from '@/components/DeviceSetupScreen';

export default function SimulatorPage() {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}images/desktop-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      {/* Glow behind phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* The Simulator */}
      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <PhoneFrame>
          {deviceData === null ? (
            <DeviceSetupScreen onComplete={setDeviceData} />
          ) : (
            <ChatInterface
              devicePayload={{
                model: deviceData.model,
                manufacturer: deviceData.manufacturer,
                osName: deviceData.osName,
                osVersion: deviceData.osVersion,
              }}
            />
          )}
        </PhoneFrame>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none">
        <p className="text-white/40 text-sm font-medium tracking-wide shadow-black drop-shadow-md">
          PhoneAssist Android Simulator • Interactive Preview
        </p>
      </div>
    </div>
  );
}
