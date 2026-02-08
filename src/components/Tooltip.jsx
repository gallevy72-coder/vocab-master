import { useState, useCallback } from 'react';
import { translateWordFallback } from '../services/gemini';

function Tooltip({ word, children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMouseEnter = useCallback(
    async () => {
      setIsVisible(true);

      if (!translation && !loading) {
        setLoading(true);
        try {
          const result = translateWordFallback(word);
          setTranslation(result);
        } catch (error) {
          console.error('Translation error:', error);
          setTranslation('[Translation unavailable]');
        } finally {
          setLoading(false);
        }
      }
    },
    [word, translation, loading]
  );

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <span
      className={`relative inline-block cursor-help ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className="absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap transform -translate-x-1/2 -translate-y-full pointer-events-none animate-fade-in"
          style={{
            left: '50%',
            bottom: '100%',
            marginBottom: '8px',
          }}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Translating...
            </span>
          ) : (
            <span className="rtl font-assistant">{translation}</span>
          )}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
        </div>
      )}
    </span>
  );
}

export default Tooltip;
