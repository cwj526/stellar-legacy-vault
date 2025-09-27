export const LIFE_FRAGMENT_NFT_STORAGE_KEY = 'life-fragment-nfts-v1';

const DEFAULT_CONTRACT_ADDRESS = '0x008985a1B4415794277De116A7e75A3C531Da5C9';

export const LIFE_FRAGMENT_NFT_CONTRACT_ADDRESS =
  import.meta.env.VITE_LIFE_FRAGMENT_NFT_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS;

export const LIFE_FRAGMENT_NFT_ABI = [
  'function mint(string answer) public returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
];
