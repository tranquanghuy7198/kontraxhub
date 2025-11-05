import { Blockchain, NetworkCluster, TxResponse } from "@utils/constants";
import { Keplr } from "@keplr-wallet/provider-extension";
import { Wallet } from "@utils/wallets/wallet";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import SuperJSON from "superjson";
import { CosmosExtra } from "@utils/wallets/cosmos/utils";
import { GasPrice } from "@cosmjs/stargate";
import { AccessConfig } from "cosmjs-types/cosmwasm/wasm/v1/types";

const DEFAULT_COSMOS_CHAIN = "cosmoshub-4";
const DEFAULT_GAS_PRICE = 0.025;

export class KeplrWallet extends Wallet {
  public key: string = "KEPLR";
  private provider: Keplr | undefined;
  private publicKey: string | undefined;

  constructor() {
    super({
      ui: {
        name: "Keplr",
        icon: "data:image/png;base64,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",
        backgroundColor: "#334851ff",
        titleColor: "#14afeb",
      },
      installLink:
        "https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en",
      networkCluster: NetworkCluster.Cosmos,
    });
    this.provider = (window as any).keplr;
  }

  get verificationKey(): string {
    if (!this.publicKey)
      throw new Error(`Cannot connect to ${this.ui.name} wallet`);
    return this.publicKey;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    // Try detecting once more
    if (!this.provider) {
      this.provider = (window as any).keplr;
      if (!this.provider)
        throw new Error(
          `${this.ui.name} is not detected in your browser. Install at ${this.installLink}`
        );
    }

    // Connect
    const chainId = blockchain?.chainId || DEFAULT_COSMOS_CHAIN;
    await this.provider.enable(chainId);
    const walletKey = await this.provider.getKey(chainId);
    this.address = walletKey.bech32Address;
    this.publicKey = Buffer.from(walletKey.pubKey).toString("base64");
    this.chainId = chainId;
  }

  public async signMessage(message: string): Promise<string> {
    await this.connect({ chainId: this.chainId } as any); // try to connect to current blockchain
    const { signature } = await this.provider!.signArbitrary(
      this.chainId!,
      this.address!,
      message
    );
    return signature;
  }

  public async deploy(
    blockchain: Blockchain,
    _abi: any, // We don't need ABI when deploying contracts
    bytecode: string,
    args: any,
    extra: CosmosExtra
  ): Promise<TxResponse> {
    // Connect and prepare
    await this.connect(blockchain);
    const client = await SigningCosmWasmClient.connectWithSigner(
      blockchain.rpcUrl,
      this.provider!.getOfflineSigner(blockchain.chainId),
      {
        gasPrice: GasPrice.fromString(
          `${DEFAULT_GAS_PRICE}${blockchain.nativeDenom}`
        ),
      }
    );

    // Upload bytecode if necessary
    if (!extra.codeId) {
      const accessConfig: AccessConfig | undefined = extra.accessType
        ? { permission: extra.accessType, addresses: extra.accessList || [] }
        : undefined;
      const { codeId } = await client.upload(
        this.address!,
        Buffer.from(bytecode, "base64"),
        "auto",
        undefined,
        accessConfig
      );
      extra.codeId = codeId;
    }

    // Instantiate
    const { contractAddress, transactionHash } = await client.instantiate(
      this.address!,
      extra.codeId,
      args,
      extra.contractName || this.address!,
      "auto",
      {
        admin: extra.admin,
        funds: extra.payment
          ? [{ denom: blockchain.nativeDenom, amount: extra.payment }]
          : undefined,
      }
    );

    return {
      txHash: transactionHash,
      contractAddresses: [
        {
          blockchainId: blockchain.id,
          address: contractAddress,
          publicity: false,
        },
      ],
    };
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: string,
    _abi: any, // We don't need ABI when reading from contract
    method: string,
    args: any
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const client = await SigningCosmWasmClient.connectWithSigner(
      blockchain.rpcUrl,
      this.provider!.getOfflineSigner(blockchain.chainId)
    );
    const result = await client.queryContractSmart(contractAddress, {
      [method]: args,
    });
    return { data: JSON.stringify(JSON.parse(SuperJSON.stringify(result))) };
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: string,
    _abi: any, // We don't need ABI when writing to contract
    method: string,
    args: any,
    extra: CosmosExtra
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const client = await SigningCosmWasmClient.connectWithSigner(
      blockchain.rpcUrl,
      this.provider!.getOfflineSigner(blockchain.chainId),
      {
        gasPrice: GasPrice.fromString(
          `${DEFAULT_GAS_PRICE}${blockchain.nativeDenom}`
        ),
      }
    );
    const { transactionHash } = await client.execute(
      this.address!,
      contractAddress,
      { [method]: args },
      "auto",
      undefined,
      extra.payment
        ? [{ denom: blockchain.nativeDenom, amount: extra.payment }]
        : undefined
    );
    return { txHash: transactionHash };
  }
}
