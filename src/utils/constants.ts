export const PRIMARY_COLOR = "#1ABC9C";

export const ADDRESS_PATTERN = "[[address]]";
export const TX_PATTERN = "[[tx]]";

export enum NetworkCluster {
  Ethereum = "ethereum",
  Kaia = "kaia",
  Ronin = "ronin",
  Solana = "solana",
  Sui = "sui",
  Aptos = "aptos",
  Cosmos = "cosmos",
  FlowChain = "flowchain",
}

export const networkClusterIcon = (networkCluster: NetworkCluster): string => {
  return {
    [NetworkCluster.Ethereum]: "https://i.ibb.co/wZsCSP9F/ic-ethereum.png",
    [NetworkCluster.Kaia]: "https://i.ibb.co/MD3Nj0sm/ic-klaytn.png",
    [NetworkCluster.Ronin]: "https://i.ibb.co/1Gw44cZC/ic-ronin.png",
    [NetworkCluster.Solana]: "https://i.ibb.co/vCHPLmDG/ic-solana.png",
    [NetworkCluster.Sui]: "https://i.ibb.co/Q4Ks6pJ/ic-sui.png",
    [NetworkCluster.Aptos]: "https://i.ibb.co/cKmHdDq7/ic-aptos.png",
    [NetworkCluster.Cosmos]: "https://i.ibb.co/7dzZHLyP/ic-cosmos-hub.png",
    [NetworkCluster.FlowChain]: "https://i.ibb.co/Y4SXx0Wy/ic-flow.png",
  }[networkCluster];
};

export enum AbiAction {
  Deploy = "deploy",
  Read = "read",
  Write = "write",
}

export type CopyStatus = "copy" | "copying" | "copied";

export type Blockchain = {
  id: string;
  code: string;
  chainId: string;
  globalId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  addressUrl: string;
  txUrl: string;
  nativeDenom: string;
  nativeToken: string;
  nativeDecimal: number;
  bech32Prefix?: string;
  networkCluster: NetworkCluster;
  logo: string;
  isTestnet: boolean;
  faucet: boolean;
};

export type ContractTemplate = {
  id: string;
  name: string;
  description?: string;
  abi: any;
  bytecode: string;
  flattenSource?: string;
  programKeypair?: number[];
  networkClusters: NetworkCluster[];
};

export type ContractAddress = {
  blockchainId: string;
  address: string;
  module?: string; // Sui & Aptos
  objectId?: string; // Sui
  publicity: boolean;
};

export type DeployedContract = {
  template: ContractTemplate;
  addresses: ContractAddress[];
};

export type TxResponse = {
  contractAddresses?: ContractAddress[]; // Deploy
  txHash?: string; // Deploy + Write
  data?: string; // Read
};
