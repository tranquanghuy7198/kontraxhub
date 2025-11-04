import {
  BrowserProvider,
  ContractFactory,
  ContractTransactionResponse,
  Eip1193Provider,
  ethers,
} from "ethers";
import { Wallet } from "@utils/wallets/wallet";
import { Blockchain, NetworkCluster, TxResponse } from "@utils/constants";
import MetaMaskIcon from "@assets/wallets/metamask.svg";
import {
  EthereumExtra,
  toMetaMaskCompatibility,
} from "@utils/wallets/ethereum/utils";
import SuperJSON from "superjson";

export class MetaMask extends Wallet {
  public key: string = "METAMASK";
  public inject: any;
  public provider: BrowserProvider | null;

  constructor() {
    // MetaMask is synchronously injected - https://github.com/MetaMask/detect-provider?tab=readme-ov-file#advanced-topics - no need to poll injection
    let ethereum: Eip1193Provider = (window as any).ethereum?.providers
      ? (window as any).ethereum.providers.find((p: any) => !!p.isMetaMask)
      : (window as any).ethereum;
    super({
      ui: {
        name: "MetaMask",
        icon: MetaMaskIcon,
        backgroundColor: "#57402cff",
        titleColor: "#be5500ff",
      },
      installLink: "https://metamask.io/download/",
      networkCluster: NetworkCluster.Ethereum,
    });
    this.inject = ethereum;
    this.provider = ethereum
      ? new ethers.BrowserProvider(ethereum, "any")
      : null;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    if (!this.provider)
      throw new Error(
        `MetaMask is not detected in your browser. Install at ${this.installLink}`
      );
    let accounts = await this.provider.send("eth_requestAccounts", []);
    this.address = accounts[0];
    await this.switchChain(blockchain);
  }

  public async signMessage(message: string): Promise<string> {
    await this.connect();
    const signer = await this.provider!.getSigner();
    return signer.signMessage(message);
  }

  public async deploy(
    blockchain: Blockchain,
    abi: any,
    bytecode: string,
    args: any[],
    extra: EthereumExtra
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const signer = await this.provider!.getSigner();
    const factory = new ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(
      ...args,
      extra.payment ? { value: extra.payment } : {}
    );
    await contract.waitForDeployment();
    return {
      contractAddresses: [
        {
          blockchainId: blockchain.id,
          address:
            typeof contract.target === "string"
              ? contract.target
              : await contract.target.getAddress(),
          publicity: false,
        },
      ],
      txHash: contract.deploymentTransaction()?.hash,
    };
  }

  public async switchChain(blockchain?: Blockchain) {
    const { chainId } = await this.provider!.getNetwork();
    const chainIdStr = "0x" + chainId.toString(16);
    if (blockchain && chainIdStr !== blockchain.chainId) {
      try {
        await this.inject.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: blockchain.chainId }],
        });
      } catch (switchError) {
        if ((switchError as { code: number }).code === 4902) {
          try {
            await this.inject.request({
              method: "wallet_addEthereumChain",
              params: [toMetaMaskCompatibility(blockchain)],
            });
            await this.switchChain(blockchain);
          } catch (addError) {
            throw new Error(`Failed to add chain ${chainIdStr}`);
          }
        } else {
          throw new Error(`Failed to switch to chain ${chainIdStr}`);
        }
      }

      // Then set result
      this.chainId = blockchain.chainId;
    } else this.chainId = chainIdStr;
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any[]
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const provider = new ethers.JsonRpcProvider(blockchain.rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const response = await contract[method](...args);
    return {
      data: JSON.stringify(JSON.parse(SuperJSON.stringify(response)).json),
    };
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any[],
    extra: EthereumExtra
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const signer = await this.provider!.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const response = (await contract[method](
      ...args,
      extra.payment ? { value: extra.payment } : {}
    )) as ContractTransactionResponse;
    return { txHash: response.hash };
  }

  public async getTxBytecode(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any,
    _extra: any // we don't need extra for bytecode generation
  ): Promise<string> {
    await this.connect(blockchain);
    const signer = await this.provider!.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return contract.interface.encodeFunctionData(method, args);
  }

  public clone(): Wallet {
    let newWallet = super.clone() as MetaMask;
    newWallet.inject = this.inject;
    newWallet.provider = this.provider;
    return newWallet;
  }
}
