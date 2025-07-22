// Desktop utilities for Tauri
// Import types only to avoid runtime issues
import type { Window as TauriWindow } from '@tauri-apps/api/window';

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
}

export class DesktopManager {
  private static instance: DesktopManager;
  private isDesktop: boolean = false;
  private permissionGranted: boolean = false;
  private window: TauriWindow | null = null;

  private constructor() {
    // Don't initialize in constructor to avoid SSR issues
  }

  static getInstance(): DesktopManager {
    if (!DesktopManager.instance) {
      DesktopManager.instance = new DesktopManager();
    }
    return DesktopManager.instance;
  }

  async init() {
    // Only run initialization if we're in a browser environment
    if (typeof window === 'undefined') return;

    try {
      // Check if we're running in Tauri
      // @ts-ignore - __TAURI__ is injected by Tauri
      this.isDesktop = typeof window !== 'undefined' && window.__TAURI__ !== undefined;
      
      if (this.isDesktop) {
        // Dynamically import Tauri window
        const { Window } = await import('@tauri-apps/api/window');
        this.window = new Window('main');
      }
      
      // Request browser notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.permissionGranted = permission === 'granted';
      }
    } catch (error) {
      console.log('Desktop features not available:', error);
      this.isDesktop = false;
    }
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && this.permissionGranted) {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon.png'
      });
    }
  }

  async minimizeWindow(): Promise<void> {
    if (!this.isDesktop || !this.window) return;
    
    try {
      await this.window.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  }

  async maximizeWindow(): Promise<void> {
    if (!this.isDesktop || !this.window) return;
    
    try {
      await this.window.maximize();
    } catch (error) {
      console.error('Failed to maximize window:', error);
    }
  }

  async hideWindow(): Promise<void> {
    if (!this.isDesktop || !this.window) return;
    
    try {
      await this.window.hide();
    } catch (error) {
      console.error('Failed to hide window:', error);
    }
  }

  async showWindow(): Promise<void> {
    if (!this.isDesktop || !this.window) return;
    
    try {
      await this.window.show();
      await this.window.setFocus();
    } catch (error) {
      console.error('Failed to show window:', error);
    }
  }

  isDesktopApp(): boolean {
    return this.isDesktop;
  }

  canSendNotifications(): boolean {
    return this.permissionGranted;
  }
}

// Create instance only when imported
let desktopManagerInstance: DesktopManager | null = null;

export function getDesktopManager(): DesktopManager {
  if (!desktopManagerInstance) {
    desktopManagerInstance = DesktopManager.getInstance();
  }
  return desktopManagerInstance;
}

// Export the desktopManager as well for compatibility
export const desktopManager = {
  init: async () => {
    const manager = getDesktopManager();
    return manager.init();
  },
  getInstance: () => getDesktopManager(),
  isDesktopApp: () => getDesktopManager().isDesktopApp(),
  canSendNotifications: () => getDesktopManager().canSendNotifications(),
  showNotification: (options: NotificationOptions) => getDesktopManager().showNotification(options),
  minimizeWindow: () => getDesktopManager().minimizeWindow(),
  maximizeWindow: () => getDesktopManager().maximizeWindow(),
  hideWindow: () => getDesktopManager().hideWindow(),
  showWindow: () => getDesktopManager().showWindow()
};