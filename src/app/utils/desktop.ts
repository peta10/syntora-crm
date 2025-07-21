"use client";

const isTauriAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
};

export const sendTaskNotification = async (title: string, body: string): Promise<void> => {
  if (!isTauriAvailable()) {
    console.log('Tauri not available - skipping desktop notification');
    return;
  }

  try {
    const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/api/notification');
    
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    
    if (permissionGranted) {
      await sendNotification({
        title,
        body,
        icon: 'FinalFavicon',
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const initializeDesktopFeatures = async (): Promise<void> => {
  if (!isTauriAvailable()) {
    console.log('Tauri not available - skipping desktop features initialization');
    return;
  }

  try {
    // Initialize window controls
    const { appWindow } = await import('@tauri-apps/api/window');
    const { enable: enableTitlebar } = await import('@tauri-apps/api/tauri');

    // Enable custom titlebar
    await enableTitlebar();

    // Listen for window events
    appWindow.listen('tauri://close-requested', () => {
      // Handle cleanup before closing
      appWindow.close();
    });

    // Initialize system tray
    const { TrayIcon } = await import('@tauri-apps/api/shell');
    await TrayIcon.create({
      iconPath: 'FinalFavicon.ico',
      menuItems: [
        {
          text: 'Show',
          click: () => appWindow.show(),
        },
        {
          text: 'Hide',
          click: () => appWindow.hide(),
        },
        {
          text: 'Quit',
          click: () => appWindow.close(),
        },
      ],
    });

  } catch (error) {
    console.error('Error initializing desktop features:', error);
  }
}; 