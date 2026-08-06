import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const INACTIVITY_MS  = 60 * 60 * 1000; // 60 minutos
const WARNING_MS     = 58 * 60 * 1000; // 58 minutos → mostrar aviso
const STORAGE_KEY    = 'last_activity_ts';

interface SessionTimeoutOptions {
  onWarning: () => void;   // Llama cuando faltan 2 minutos
  onExpired: () => void;   // Llama cuando la sesión expiró
}

/**
 * Hook que detecta inactividad del usuario y cierra sesión automáticamente
 * al superar INACTIVITY_MS de inactividad.
 * Dispara onWarning() a los WARNING_MS para mostrar un aviso previo.
 */
export function useSessionTimeout({ onWarning, onExpired }: SessionTimeoutOptions) {
  const navigate    = useNavigate();
  const warningRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnedRef   = useRef(false);

  const clearTimers = useCallback(() => {
    if (warningRef.current) clearTimeout(warningRef.current);
    if (expireRef.current)  clearTimeout(expireRef.current);
  }, []);

  const doLogout = useCallback(async (reason: 'inactivity' | 'manual' = 'inactivity') => {
    clearTimers();
    localStorage.removeItem(STORAGE_KEY);
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await axios.post(
          import.meta.env.VITE_API_URL + '/webadmin/logout',
          { reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // Ignorar errores de red; de todas formas limpiamos
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    onExpired();
    navigate('/login', { replace: true });
  }, [clearTimers, navigate, onExpired]);

  const resetTimers = useCallback(() => {
    clearTimers();
    warnedRef.current = false;
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    warningRef.current = setTimeout(() => {
      warnedRef.current = true;
      onWarning();
    }, WARNING_MS);

    expireRef.current = setTimeout(() => {
      doLogout('inactivity');
    }, INACTIVITY_MS);
  }, [clearTimers, doLogout, onWarning]);

  // Chequear si ya expiró al montar (ej: después de recargar)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return; // No hay sesión activa

    const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const elapsed = Date.now() - lastActivity;

    if (lastActivity > 0 && elapsed >= INACTIVITY_MS) {
      // Ya expiró mientras estaba recargando/cerrada la pestaña
      doLogout('inactivity');
      return;
    }

    // Ajustar timers al tiempo restante
    const remaining = lastActivity > 0 ? Math.max(0, INACTIVITY_MS - elapsed) : INACTIVITY_MS;
    const warningRemaining = Math.max(0, remaining - (INACTIVITY_MS - WARNING_MS));

    localStorage.setItem(STORAGE_KEY, (Date.now() - (INACTIVITY_MS - remaining)).toString());

    if (warningRemaining > 0) {
      warningRef.current = setTimeout(() => {
        warnedRef.current = true;
        onWarning();
      }, warningRemaining);
    } else if (!warnedRef.current) {
      warnedRef.current = true;
      onWarning();
    }

    expireRef.current = setTimeout(() => {
      doLogout('inactivity');
    }, remaining);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Escuchar eventos de actividad del usuario
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    const handleActivity = () => {
      if (!warnedRef.current) {
        // Aún no estamos en el aviso: resetear silenciosamente
        resetTimers();
      }
      // Si ya estamos en el aviso de 2 min, el usuario debe hacer click en "Seguir Sesión"
      // para que se resetee explícitamente — no lo hacemos automático
    };

    EVENTS.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));
    resetTimers(); // Inicializar timers

    return () => {
      clearTimers();
      EVENTS.forEach(ev => window.removeEventListener(ev, handleActivity));
    };
  }, [resetTimers, clearTimers]);

  /** Llamar desde el modal "Seguir Sesión" */
  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  /** Llamar desde el botón "Cerrar Sesión" manual */
  const manualLogout = useCallback(() => {
    doLogout('manual');
  }, [doLogout]);

  return { extendSession, manualLogout };
}
