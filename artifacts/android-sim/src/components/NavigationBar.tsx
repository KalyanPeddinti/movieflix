import { ChevronLeft, Circle, Square } from 'lucide-react';

export function NavigationBar() {
  return (
    <div className="h-12 w-full flex items-center justify-around px-12 pb-2 bg-surface">
      <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-outline">
        <ChevronLeft size={24} strokeWidth={3} />
      </button>
      <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-outline">
        <Circle size={20} strokeWidth={3.5} />
      </button>
      <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-outline">
        <Square size={18} strokeWidth={3.5} />
      </button>
    </div>
  );
}
