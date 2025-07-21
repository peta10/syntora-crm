'use client';

import React from 'react';

declare global {
  interface Window {
    __TAURI__?: {
      notification?: {
        isPermissionGranted: () => Promise<boolean>;
        requestPermission: () => Promise<string>;
        sendNotification: (options: { title: string; body: string }) => Promise<void>;
      };
    };
  }
}

type NotifyFunction = (title: string, body: string) => Promise<void>;

interface NotificationWrapperProps {
  onNotify: (notify: NotifyFunction) => void;
}

export const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ onNotify }) => {
  const notify = async (title: string, body: string) => {
    if (typeof window === 'undefined') return;

    try {
      // Check if we're running in Tauri
      if (window.__TAURI__?.notification) {
        let permissionGranted = await window.__TAURI__.notification.isPermissionGranted();
        
        if (!permissionGranted) {
          const permission = await window.__TAURI__.notification.requestPermission();
          permissionGranted = permission === 'granted';
        }
        
        if (permissionGranted) {
          await window.__TAURI__.notification.sendNotification({ title, body });
          return;
        }
      }

      // Fallback to browser notifications
      if ('Notification' in window) {
        let permission = Notification.permission;
        
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      }
    } catch (error) {
      console.warn('Failed to send notification:', error);
    }
  };

  React.useEffect(() => {
    onNotify(notify);
  }, [onNotify]);

  return null;
}; 