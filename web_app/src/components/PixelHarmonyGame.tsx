import React, { useState, useRef, useEffect } from 'react';

interface PixelHarmonyGameProps {
  width?: number;
  height?: number;
  className?: string;
}

const PixelHarmonyGame: React.FC<PixelHarmonyGameProps> = ({ 
  width = 800, 
  height = 600, 
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
    <div className={`relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg overflow-hidden shadow-lg ${className}`}>
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
        width={width}
        height={height}
        className="w-full h-full border-0"
        title="Pixel Harmony - Mental Health Game"
        allow="fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
      />
    </div>
  );
};

export default PixelHarmonyGame;
