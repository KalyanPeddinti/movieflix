import { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // Android style usually skips AM/PM in status bar if using 24h, or formats compactly
      setTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-7 w-full flex items-center justify-between px-6 text-xs font-medium text-foreground z-50">
      <div className="flex-1">{time}</div>
      
      {/* Notch space is handled by absolute positioning in parent, this just flexes around it */}
      
      <div className="flex-1 flex justify-end items-center gap-1.5 opacity-90">
        <Wifi size={14} strokeWidth={2.5} />
        <Signal size={14} strokeWidth={2.5} />
        <div className="flex items-center gap-0.5">
          <span>84%</span>
          <BatteryMedium size={16} strokeWidth={2.5} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}
