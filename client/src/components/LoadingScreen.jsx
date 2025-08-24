import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern">
      <div className="relative">
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-20"></div>
        <div className="absolute inset-2 rounded-full border-4 border-purple-400 animate-ping opacity-40 delay-200"></div>
        <div className="absolute inset-4 rounded-full border-4 border-pink-400 animate-ping opacity-60 delay-400"></div>
        
        {/* Core */}
        <div className="relative w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center shadow-neon animate-pulse-glow">
          <div className="w-8 h-8 bg-white rounded-full animate-pulse shadow-neon"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;