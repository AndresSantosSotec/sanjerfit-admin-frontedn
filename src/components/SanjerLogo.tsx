import React from 'react';

const SanjerLogo = ({ className = "w-32" }: { className?: string }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="font-bold text-2xl" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.3)' }}>
        <span className="text-white">CooSanjer</span>
        <span className="text-green-400">FIT</span>
      </div>
      <div className="ml-2">
        <svg 
          width="30" 
          height="30" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}
        >
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="white" 
            strokeWidth="5" 
            fill="none" 
          />
          <path 
            d="M30 50 Q 50 30, 70 50 T 30 50" 
            stroke="#22c55e" 
            strokeWidth="5" 
            fill="none" 
          />
          <path 
            d="M50 20 L 50 80" 
            stroke="white" 
            strokeWidth="3" 
            strokeDasharray="5,5" 
          />
        </svg>
      </div>
    </div>
  );
};

export default SanjerLogo;