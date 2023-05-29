import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      walletBOC: string;
      contentProvider: string;
      webviewPreloadPath: string;
      cookies: {
        setPath(): void;
        set(key: string, value: string, callback: (error: any) => void): void;
        get(key: string, callback: (error: any, data: any) => void): void;
        remove(
          key: string,
          value: string,
          callback: (error: any) => void
        ): void;
        clear(callback: (error: any) => void): void;
      };
      ipcRenderer: {
        removeListener(
          channel: Channels,
          listener: (args: unknown[]) => void
        ): void;
        removeAllListeners(channel: Channels): void;
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
