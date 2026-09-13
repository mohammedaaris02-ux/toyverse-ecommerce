'use client';

import { useEffect } from 'react';

export function OrderRefresh() {
  useEffect(() => {
    const refresh = () => window.location.reload();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  return null;
}
