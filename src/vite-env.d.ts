/// <reference types="vite/client" />

interface OneKeyEthereumProvider {
  isOneKey?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  providers?: OneKeyEthereumProvider[];
}

declare global {
  interface Window {
    $onekey?: {
      ethereum?: OneKeyEthereumProvider;
    };
    ethereum?: OneKeyEthereumProvider & { providers?: OneKeyEthereumProvider[] };
  }
}

export {};
