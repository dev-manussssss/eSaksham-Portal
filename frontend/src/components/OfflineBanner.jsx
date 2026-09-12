import { useState, useEffect } from 'react';
import { getLastSyncTime } from '../offline/cache.js';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [syncTime, setSyncTime] = useState(getLastSyncTime());

  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      setSyncTime(getLastSyncTime());
    };
    const handleOffline = () => {
      setOffline(true);
      setSyncTime(getLastSyncTime());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-amber-500 text-slate-900 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm border-b border-amber-600">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-slate-900" style={{ fontSize: 18 }}>wifi_off</span>
        <span>
          <strong>Offline Mode Active</strong> — Displaying authoritative last synchronized state.
          {syncTime && (
            <span className="ml-2 opacity-90 font-mono text-[11px]">
              (Last Synchronized: {new Date(syncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          )}
        </span>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-600/30 px-2 py-0.5 rounded">
        Read-Only Cache
      </span>
    </div>
  );
}
