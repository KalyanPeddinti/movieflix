import { useEffect, useRef } from "react";

interface TrailerModalProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

export function TrailerModal({ videoKey, title, onClose }: TrailerModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const embedUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
      data-testid="trailer-modal"
    >
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close trailer"
            data-testid="btn-close-trailer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-2xl bg-black">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            data-testid="trailer-iframe"
          />
        </div>

        <p className="mt-3 text-center text-white/30 text-xs">
          Click outside or press ESC to close
        </p>
      </div>
    </div>
  );
}
