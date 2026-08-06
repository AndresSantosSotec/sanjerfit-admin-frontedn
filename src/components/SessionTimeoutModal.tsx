import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionTimeoutModalProps {
  open: boolean;
  onExtend: () => void;
  onLogout: () => void;
}

const COUNTDOWN_SECONDS = 120; // 2 minutos

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  open,
  onExtend,
  onLogout,
}) => {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reiniciar y arrancar la cuenta regresiva cada vez que el modal se abre
  useEffect(() => {
    if (open) {
      setSeconds(COUNTDOWN_SECONDS);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  const minutes = Math.floor(seconds / 60);
  const secs    = seconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Porcentaje restante para el arco SVG
  const pct = seconds / COUNTDOWN_SECONDS;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  const handleExtend = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onExtend();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5">
              
              {/* Icono de advertencia */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>

              {/* Título */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Sesión a punto de expirar
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tu sesión se cerrará por inactividad en:
                </p>
              </div>

              {/* Contador circular */}
              <div className="relative flex items-center justify-center">
                <svg width="96" height="96" className="-rotate-90">
                  {/* Track */}
                  <circle
                    cx="48" cy="48" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  {/* Progress */}
                  <circle
                    cx="48" cy="48" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`transition-all duration-1000 ${seconds <= 30 ? 'text-red-500' : 'text-amber-500'}`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <Clock className={`w-4 h-4 mb-0.5 ${seconds <= 30 ? 'text-red-500' : 'text-amber-500'}`} />
                  <span className={`text-xl font-bold tabular-nums ${seconds <= 30 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {display}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2.5 w-full">
                <Button
                  id="session-extend-btn"
                  onClick={handleExtend}
                  className="w-full btn-glow-green text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Seguir Sesión
                </Button>
                <Button
                  id="session-logout-btn"
                  variant="outline"
                  onClick={onLogout}
                  className="w-full border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeoutModal;
