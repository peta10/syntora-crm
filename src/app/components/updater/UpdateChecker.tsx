'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface UpdateInfo {
  version: string;
  date: string;
  body: string;
}

interface UpdateCheckerProps {
  autoCheck?: boolean;
  checkInterval?: number; // in milliseconds
}

export function UpdateChecker({ autoCheck = true, checkInterval = 3600000 }: UpdateCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Check if we're running in Tauri
    const checkTauri = async () => {
      try {
        // @ts-ignore - Tauri API check
        if (typeof window !== 'undefined' && window.__TAURI__) {
          setIsTauri(true);
          
          if (autoCheck) {
            await checkForUpdates();
            
            // Set up periodic checks
            const interval = setInterval(checkForUpdates, checkInterval);
            return () => clearInterval(interval);
          }
        }
      } catch (err) {
        console.log('Not running in Tauri environment');
      }
    };

    checkTauri();
  }, [autoCheck, checkInterval]);

  const checkForUpdates = async () => {
    if (!isTauri) return;
    
    setIsChecking(true);
    setError(null);

    try {
      // Dynamic import for Tauri APIs
      const { check } = await import('@tauri-apps/plugin-updater');
      
      const update = await check();
      
      if (update && update.available) {
        setUpdateAvailable({
          version: update.version,
          date: update.date || new Date().toISOString(),
          body: update.body || 'New version available'
        });
        setShowDialog(true);
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError('Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const downloadAndInstall = async () => {
    if (!updateAvailable || !isTauri) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');
      
      const update = await check();
      
      if (update && update.available) {
        // Set up progress tracking
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setDownloadProgress(Math.min(progress, 90));
        }, 200);

        await update.downloadAndInstall();
        
        clearInterval(progressInterval);
        setDownloadProgress(100);
        
        // Wait a moment to show completion
        setTimeout(async () => {
          await relaunch();
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to download and install update:', err);
      setError('Failed to download and install update');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleSkipUpdate = () => {
    setShowDialog(false);
    setUpdateAvailable(null);
  };

  // Don't render anything if not in Tauri
  if (!isTauri) {
    return null;
  }

  return (
    <>
      {/* Manual check button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={checkForUpdates}
        disabled={isChecking}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? 'Checking...' : 'Check for Updates'}
      </Button>

      {/* Update Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-400" />
              Update Available
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              A new version of Syntora CRM is available.
            </DialogDescription>
          </DialogHeader>

          {updateAvailable && (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-400">Version {updateAvailable.version}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Released: {new Date(updateAvailable.date).toLocaleDateString()}
                </p>
                <div className="mt-3 text-sm text-gray-300">
                  {updateAvailable.body}
                </div>
              </div>

              {isDownloading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4 animate-pulse" />
                    Downloading update...
                  </div>
                  <Progress value={downloadProgress} className="w-full" />
                  <p className="text-xs text-gray-400 text-center">
                    {downloadProgress}% complete
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkipUpdate}
              disabled={isDownloading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Skip
            </Button>
            <Button
              onClick={downloadAndInstall}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateChecker;
