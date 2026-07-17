import React from 'react';

const SanjerLogo = ({ className = "w-auto", isLight = false, hideText = false }: { className?: string, isLight?: boolean, hideText?: boolean }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark */}
      <div className="relative flex-shrink-0">
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke={isLight ? "#0d47a1" : "#ffffff"}
            strokeWidth="6"
            fill={isLight ? "rgba(13, 71, 161, 0.05)" : "rgba(255, 255, 255, 0.1)"}
          />
          {/* Inner ring */}
          <circle
            cx="50"
            cy="50"
            r="30"
            stroke="#22c55e"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8 4"
          />
          {/* Movement arc */}
          <path
            d="M25 50 Q 37 32, 50 50 Q 63 68, 75 50"
            stroke="#22c55e"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx="50" cy="50" r="5" fill="#22c55e" />
        </svg>
      </div>

      {/* Wordmark */}
      {!hideText && (
        <div className="leading-none">
          <div
            className="font-bold text-xl tracking-tight"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
          >
            <span className={isLight ? "text-slate-800" : "text-white"}>CooSanjer</span>
            <span className="text-sanjer-green">FIT</span>
          </div>
          <div className={`text-[9px] font-semibold tracking-widest uppercase mt-0.5 ${isLight ? "text-slate-400" : "text-white/40"}`}>
            Admin Panel
          </div>
        </div>
      )}
    </div>
  );
};

export default SanjerLogo;