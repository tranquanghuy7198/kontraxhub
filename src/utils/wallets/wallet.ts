import { Blockchain, NetworkCluster, TxResponse } from "@utils/constants";

export const WALLET_STORAGE = "wallets";

export type WalletUI = {
  name: string;
  icon: string;
  backgroundColor: string;
  titleColor: string;
};

export class Wallet {
  public key: string = "";
  public ui: WalletUI;
  public installLink: string;
  public networkCluster: NetworkCluster;
  public address?: string;
  public chainId?: string;

  constructor({
    ui,
    installLink,
    networkCluster,
  }: {
    ui: WalletUI;
    installLink: string;
    networkCluster: NetworkCluster;
  }) {
    this.ui = ui;
    this.installLink = installLink;
    this.networkCluster = networkCluster;
  }

  get verificationKey(): string {
    if (!this.address)
      throw new Error(`Cannot connect to ${this.ui.name} wallet`);
    return this.address;
  }

  public async connect(blockchain?: Blockchain) {
    console.log(blockchain);
    throw new Error("Method not implemented.");
  }

  public async signMessage(
    message: string,
    nonce?: string,
    timestamp?: number,
    expiration?: number
  ): Promise<string> {
    console.log(message, nonce, timestamp, expiration);
    throw new Error("Method not implemented.");
  }

  public async faucet(blockchain: Blockchain): Promise<number> {
    console.log(blockchain);
    throw new Error("Method not implemented.");
  }

  public async deploy(
    blockchain: Blockchain,
    abi: any,
    bytecode: string,
    args: any,
    extra: any
  ): Promise<TxResponse> {
    console.log(blockchain, abi, bytecode, args, extra);
    throw new Error("Method not implemented.");
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any
  ): Promise<TxResponse> {
    console.log(blockchain, contractAddress, abi, method, args);
    throw new Error("Method not implemented.");
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any,
    extra: any
  ): Promise<TxResponse> {
    console.log(blockchain, contractAddress, abi, method, args, extra);
    throw new Error("Method not implemented.");
  }

  public async getTxBytecode(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any,
    extra: any
  ): Promise<string> {
    console.log(blockchain, contractAddress, abi, method, args, extra);
    throw new Error("Method not implemented.");
  }
}
