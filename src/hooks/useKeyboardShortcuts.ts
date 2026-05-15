import { useEffect } from 'react';

export interface ShortcutHandlers {
  onRefresh?: () => void;
  onPeriodHoje?: () => void;
  onPeriod7d?: () => void;
  onPeriod30d?: () => void;
  onPeriodMes?: () => void;
  onToggleHelp?: () => void;
  onCloseHelp?: () => void;
  onToggleFullscreen?: () => void;
  enabled?: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({
  onRefresh,
  onPeriodHoje,
  onPeriod7d,
  onPeriod30d,
  onPeriodMes,
  onToggleHelp,
  onCloseHelp,
  onToggleFullscreen,
  enabled = true,
}: ShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseHelp?.();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === '?') {
        e.preventDefault();
        onToggleHelp?.();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'r') {
        e.preventDefault();
        onRefresh?.();
      } else if (k === '1') {
        e.preventDefault();
        onPeriodHoje?.();
      } else if (k === '2') {
        e.preventDefault();
        onPeriod7d?.();
      } else if (k === '3') {
        e.preventDefault();
        onPeriod30d?.();
      } else if (k === '4') {
        e.preventDefault();
        onPeriodMes?.();
      } else if (k === 'f') {
        e.preventDefault();
        onToggleFullscreen?.();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, onRefresh, onPeriodHoje, onPeriod7d, onPeriod30d, onPeriodMes, onToggleHelp, onCloseHelp, onToggleFullscreen]);
}
