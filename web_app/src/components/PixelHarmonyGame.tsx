import React, { useState, useRef, useEffect } from 'react';

interface PixelHarmonyGameProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const PixelHarmonyGame: React.FC<PixelHarmonyGameProps> = ({ 
  width = 800, // Reserved for future use
  height = 600, // Reserved for future use
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      }
    };
  }, []);

  return (
    <div className={`w-full h-full ${className}`} style={{ position: 'relative' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading Pixel Harmony...</p>
            <p className="text-sm opacity-75">Your mental health journey awaits</p>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-50 z-10">
          <div className="text-white text-center p-6">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-lg font-medium">Game Failed to Load</p>
            <p className="text-sm opacity-75">Please check your connection and try again</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/game/index.html"
        width="100%"
        height="100%"
        className="w-full h-full border-0"
        title="Pixel Harmony - Mental Health Game"
        allow="fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
        style={{ 
          border: 'none',
          outline: 'none',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default PixelHarmonyGame;
