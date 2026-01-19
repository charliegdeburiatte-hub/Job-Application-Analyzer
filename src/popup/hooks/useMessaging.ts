import { useCallback } from 'react';
import { ExtensionMessage } from '@/shared/types';

/**
 * Hook to send messages to background script
 */
export function useMessaging() {
  const sendMessage = useCallback(async <T = any>(message: ExtensionMessage): Promise<T> => {
    try {
      const response = await browser.runtime.sendMessage(message);
      return response as T;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);

  return {
    sendMessage,
  };
}
