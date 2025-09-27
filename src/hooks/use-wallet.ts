import { useCallback, useEffect, useMemo, useState } from 'react';

type EthereumProvider = {
  isOneKey?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  providers?: EthereumProvider[];
};

type WalletState = {
  account: string | null;
  chainId: string | null;
  isConnecting: boolean;
  providerAvailable: boolean;
  error: string | null;
  connect: () => Promise<void>;
};

const findOneKeyProvider = (): EthereumProvider | undefined => {
  if (typeof window === 'undefined') return undefined;
  const anyWindow = window as typeof window & {
    $onekey?: { ethereum?: EthereumProvider };
    ethereum?: EthereumProvider & { providers?: EthereumProvider[] };
  };

  if (anyWindow.$onekey?.ethereum) {
    return anyWindow.$onekey.ethereum;
  }

  const { ethereum } = anyWindow;

  if (!ethereum) {
    return undefined;
  }

  if (ethereum.providers?.length) {
    return ethereum.providers.find((provider) => provider.isOneKey) ?? ethereum.providers[0];
  }

  if (ethereum.isOneKey) {
    return ethereum;
  }

  return ethereum;
};

export const useWallet = (): WalletState => {
  const [provider, setProvider] = useState<EthereumProvider | undefined>();
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectProvider = () => {
      const detected = findOneKeyProvider();
      setProvider(detected);
      return detected;
    };

    const detected = detectProvider();

    if (!detected) {
      const handler = () => {
        detectProvider();
      };
      window.addEventListener('ethereum#initialized', handler as EventListener, { once: true });
      return () => {
        window.removeEventListener('ethereum#initialized', handler as EventListener);
      };
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!provider) return;

    let mounted = true;

    const initialise = async () => {
      try {
        const [accounts, chain] = await Promise.all([
          provider.request({ method: 'eth_accounts' }),
          provider.request({ method: 'eth_chainId' }).catch(() => null),
        ]);

        if (!mounted) return;
        if (Array.isArray(accounts) && accounts.length > 0) {
          setAccount(accounts[0]);
        }
        if (chain) {
          setChainId(chain as string);
        }
      } catch (err) {
        console.error('Failed to initialise wallet', err);
      }
    };

    initialise();

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
    };

    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      mounted = false;
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [provider]);

  const connect = useCallback(async () => {
    if (!provider) {
      setError('未检测到 OneKey 钱包插件。请先安装 OneKey 浏览器扩展。');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error('Failed to connect wallet', err);
      setError(err instanceof Error ? err.message : '连接钱包时发生未知错误');
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  return useMemo(
    () => ({
      account,
      chainId,
      isConnecting,
      providerAvailable: Boolean(provider),
      error,
      connect,
    }),
    [account, chainId, isConnecting, provider, error, connect],
  );
};

export type UseWalletReturn = ReturnType<typeof useWallet>;
