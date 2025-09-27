import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserProvider, Contract, Interface, ZeroAddress, id } from 'ethers';
import {
  LIFE_FRAGMENT_NFT_ABI,
  LIFE_FRAGMENT_NFT_CONTRACT_ADDRESS,
  LIFE_FRAGMENT_NFT_STORAGE_KEY,
} from '@/lib/nft-config';

export type MintedLifeFragment = {
  id: string;
  text: string;
  mintedAt: string;
  mintedBy: string;
  txHash: string;
  tokenId: string | null;
};

type EthereumProvider = {
  isOneKey?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  providers?: EthereumProvider[];
};

type MintProgress = {
  progress: number;
  message: string;
};

const TRANSFER_EVENT = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)';

const loadFromStorage = (): MintedLifeFragment[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LIFE_FRAGMENT_NFT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn('Failed to parse minted life fragments from storage', error);
    return [];
  }
};

const persistToStorage = (records: MintedLifeFragment[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LIFE_FRAGMENT_NFT_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn('Failed to persist minted life fragments', error);
  }
};

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mint-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useLifeFragmentNftMinting = () => {
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const providerRef = useRef<EthereumProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [mintedFragments, setMintedFragments] = useState<MintedLifeFragment[]>(() => loadFromStorage());

  const detectProvider = useCallback((): EthereumProvider | null => {
    if (typeof window === 'undefined') return null;
    const anyWindow = window as typeof window & {
      ethereum?: EthereumProvider & { providers?: EthereumProvider[] };
      $onekey?: { ethereum?: EthereumProvider };
      onekey?: { ethereum?: EthereumProvider };
    };

    const candidates: EthereumProvider[] = [];

    if (anyWindow.ethereum?.providers?.length) {
      candidates.push(...anyWindow.ethereum.providers);
    }
    if (anyWindow.ethereum) {
      candidates.push(anyWindow.ethereum);
    }
    if (anyWindow.$onekey?.ethereum) {
      candidates.push(anyWindow.$onekey.ethereum);
    }
    if (anyWindow.onekey?.ethereum) {
      candidates.push(anyWindow.onekey.ethereum);
    }

    const unique: EthereumProvider[] = [];
    for (const candidate of candidates) {
      if (!candidate || typeof candidate.request !== 'function') continue;
      if (unique.includes(candidate)) continue;
      unique.push(candidate);
    }

    const detected = unique[0] ?? null;
    if (detected) {
      providerRef.current = detected;
      setProvider(detected);
    }
    return detected;
  }, []);

  const waitForProvider = useCallback(async (): Promise<EthereumProvider | null> => {
    const existing = detectProvider();
    if (existing) return existing;

    if (typeof window === 'undefined') return null;

    return new Promise((resolve) => {
      const handle = () => {
        const detected = detectProvider();
        if (detected) {
          resolve(detected);
        }
      };

      window.addEventListener('ethereum#initialized', handle, { once: true });
      window.addEventListener('onekey#initialized', handle, { once: true });

      setTimeout(() => {
        const detected = detectProvider();
        resolve(detected);
      }, 1500);
    });
  }, [detectProvider]);

  const refreshAccounts = useCallback(async (injected?: EthereumProvider | null) => {
    const target = injected ?? providerRef.current;
    if (!target) return;
    try {
      const accounts = await target.request({ method: 'eth_accounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAccount(accounts[0] as string);
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.warn('Failed to query accounts', error);
    }
  }, []);

  const refreshChainId = useCallback(async (injected?: EthereumProvider | null) => {
    const target = injected ?? providerRef.current;
    if (!target) return;
    try {
      const chain = await target.request({ method: 'eth_chainId' });
      if (typeof chain === 'string') {
        setChainId(chain);
      }
    } catch (error) {
      console.warn('Failed to query chain id', error);
    }
  }, []);

  useEffect(() => {
    waitForProvider();
  }, [waitForProvider]);

  useEffect(() => {
    const injected = providerRef.current;
    if (!injected) return;

    let mounted = true;

    refreshAccounts(injected);
    refreshChainId(injected);

    const handleAccountsChanged = (accounts: string[]) => {
      if (!mounted) return;
      setAccount(accounts?.[0] ?? null);
    };

    const handleChainChanged = (newChainId: string) => {
      if (!mounted) return;
      setChainId(newChainId);
      window.location.reload();
    };

    injected.on?.('accountsChanged', handleAccountsChanged);
    injected.on?.('chainChanged', handleChainChanged);

    return () => {
      mounted = false;
      injected.removeListener?.('accountsChanged', handleAccountsChanged);
      injected.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [provider, refreshAccounts, refreshChainId]);

  useEffect(() => {
    persistToStorage(mintedFragments);
  }, [mintedFragments]);

  const connectWallet = useCallback(async () => {
    const injected = await waitForProvider();
    if (!injected) {
      const message = '未检测到浏览器钱包插件，请先安装或解锁钱包。';
      setWalletError(message);
      throw new Error(message);
    }

    try {
      setWalletError(null);
      setIsConnecting(true);
      const accounts = await injected.request({ method: 'eth_requestAccounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAccount(accounts[0] as string);
        providerRef.current = injected;
        setProvider(injected);
        await refreshChainId(injected);
        return accounts[0] as string;
      }
      throw new Error('未获取到账户，请确认钱包已授权。');
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接钱包时发生未知错误';
      setWalletError(message);
      throw new Error(message);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshChainId, waitForProvider]);

  const mintOnChain = useCallback(
    async (text: string, onProgress?: (progress: MintProgress) => void) => {
      if (!text || !text.trim()) {
        throw new Error('铸造内容不能为空');
      }

      const injected = await waitForProvider();
      if (!injected) {
        throw new Error('未检测到浏览器钱包，请确认钱包插件已就绪。');
      }

      if (!account) {
        throw new Error('请先连接钱包再尝试铸造 NFT。');
      }

      if (!LIFE_FRAGMENT_NFT_CONTRACT_ADDRESS) {
        throw new Error('尚未配置合约地址，请在 nft-config.ts 或环境变量中设置。');
      }

      setIsMinting(true);
      setMintError(null);

      try {
        onProgress?.({ progress: 15, message: '等待浏览器钱包响应...' });
        const providerInstance = new BrowserProvider(injected);
        const signer = await providerInstance.getSigner();

        onProgress?.({ progress: 40, message: '提交铸造交易...' });
        const contract = new Contract(LIFE_FRAGMENT_NFT_CONTRACT_ADDRESS, LIFE_FRAGMENT_NFT_ABI, signer);
        const tx = await contract.mint(text);

        onProgress?.({ progress: 70, message: '等待交易确认...' });
        const receipt = await tx.wait();

        const transferTopic = id('Transfer(address,address,uint256)');
        const erc721Interface = new Interface([TRANSFER_EVENT]);
        let mintedTokenId: string | null = null;

        for (const log of receipt.logs) {
          const sameAddress = log.address?.toLowerCase() === LIFE_FRAGMENT_NFT_CONTRACT_ADDRESS.toLowerCase();
          const matchedTopic = log.topics?.[0] === transferTopic;
          if (!sameAddress || !matchedTopic) continue;

          try {
            const parsed = erc721Interface.parseLog(log);
            const from = (parsed.args.from as string) ?? '';
            const to = (parsed.args.to as string) ?? '';
            if (from === ZeroAddress && to.toLowerCase() === account.toLowerCase()) {
              mintedTokenId = parsed.args.tokenId.toString();
              break;
            }
          } catch (parseError) {
            console.warn('Failed to parse Transfer log', parseError);
          }
        }

        const minted: MintedLifeFragment = {
          id: createId(),
          text: text.trim(),
          mintedAt: new Date().toISOString(),
          mintedBy: account,
          txHash: tx.hash,
          tokenId: mintedTokenId,
        };

        setMintedFragments((prev) => [minted, ...prev]);
        onProgress?.({ progress: 100, message: '铸造完成' });
        return minted;
      } catch (error) {
        const message = error instanceof Error ? error.message : '铸造失败，请稍后再试。';
        setMintError(message);
        throw new Error(message);
      } finally {
        setIsMinting(false);
      }
    },
    [account, waitForProvider]
  );

  const burnLocalRecord = useCallback((id: string) => {
    setMintedFragments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const providerAvailable = Boolean(provider || providerRef.current);

  return {
    account,
    chainId,
    isConnecting,
    isMinting,
    walletError,
    mintError,
    mintedFragments,
    providerAvailable,
    detectProvider,
    waitForProvider,
    connectWallet,
    mintOnChain,
    burnLocalRecord,
  };
};

export type UseLifeFragmentNftMintingReturn = ReturnType<typeof useLifeFragmentNftMinting>;
