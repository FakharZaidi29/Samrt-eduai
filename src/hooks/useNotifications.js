import { useEffect } from 'react';

export function useNotifications(user) {
  useEffect(() => {
    if (!user) return;
    if (!('Notification' in window)) return;

    // Request permission once
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  const send = (title, body, onClick) => {
    if (Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
    if (onClick) n.onclick = () => { window.focus(); onClick(); n.close(); };
    setTimeout(() => n.close(), 6000);
  };

  return { send };
}
