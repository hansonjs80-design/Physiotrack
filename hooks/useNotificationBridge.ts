import { useEffect } from 'react';

type ActionHandler = (bedId: number) => void;

/**
 * Listens for messages from the Service Worker (e.g., Notification Actions)
 * and triggers the corresponding application logic.
 */
export const useNotificationBridge = (onNextStep: ActionHandler) => {
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      // Check for the specific action type sent from sw.js
      if (event.data && event.data.type === 'NEXT_STEP' && event.data.bedId) {
        console.log(`[NotificationBridge] Received NEXT_STEP action for Bed ${event.data.bedId}`);
        onNextStep(event.data.bedId);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [onNextStep]);
};