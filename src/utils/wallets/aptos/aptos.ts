import {
  AdapterWallet,
  Network,
  WalletCore,
} from "@aptos-labs/wallet-adapter-core";
import { Wallet } from "@utils/wallets/wallet";
import { Blockchain, NetworkCluster, TxResponse } from "@utils/constants";
import { WalletIcon } from "@wallet-standard/core";
import {
  AccountAddress,
  Aptos,
  AptosConfig,
  EntryFunctionArgumentTypes,
  SimpleEntryFunctionArgumentTypes,
  TypeArgument,
} from "@aptos-labs/ts-sdk";
import SuperJSON from "superjson";
import { AptosCompiledBytecode } from "@utils/wallets/aptos/utils";

const APTOS_NETWORKS: Record<Network, number> = {
  mainnet: 1,
  testnet: 2,
  devnet: 10,
  shelbynet: 1990,
  local: 204,
  custom: 204,
};

export class AptosWallet extends Wallet {
  private adapter: AdapterWallet | undefined;
  private publicKey: string | undefined;

  constructor(
    key: string,
    defaultIcon: WalletIcon,
    defaultInstallLink: string,
    backgroundColor: string,
    titleColor: string
  ) {
    const core = new WalletCore();
    const wallet = core.wallets.find((w) => w.name === key);
    super({
      ui: {
        name: wallet?.name || key,
        icon: wallet?.icon || defaultIcon,
        backgroundColor: backgroundColor,
        titleColor: titleColor,
      },
      installLink: wallet?.url || defaultInstallLink,
      networkCluster: NetworkCluster.Aptos,
    });
    this.key = key;
    this.adapter = wallet;
  }

  get verificationKey(): string {
    if (!this.publicKey)
      throw new Error(`Cannot connect to ${this.ui.name} wallet`);
    return this.publicKey;
  }

  public async connect(blockchain?: Blockchain) {
    // Try detecting once more
    if (!this.adapter) {
      const core = new WalletCore();
      await core.connect(this.key);
      this.adapter = core.wallet || undefined;
      if (!this.adapter)
        throw new Error(
          `${this.ui.name} is not detected in your browser. Install at ${this.installLink}`
        );
    }

    // Now connect
    const network = blockchain ? (blockchain.chainId as Network) : undefined;
    const result = await this.adapter.features["aptos:connect"].connect(
      true,
      network ? { name: network, chainId: APTOS_NETWORKS[network] } : undefined
    );
    if (result.status === "Rejected")
      throw new Error("User rejected connection");
    this.address = result.args.address.toString();
    this.publicKey = result.args.publicKey.toString();
    if (blockchain && this.adapter.chains.includes(`aptos:${network}`))
      this.chainId = network;
    else this.chainId = "--";
  }

  public async signMessage(message: string, nonce?: string): Promise<string> {
    if (!nonce) throw new Error("Invalid message data, nonce is required");
    await this.connect();
    const result = await this.adapter!.features[
      "aptos:signMessage"
    ].signMessage({ address: true, application: true, message, nonce });
    if (result.status === "Rejected")
      throw new Error("User rejected signature");
    return result.args.signature.toString();
  }

  public async faucet(blockchain: Blockchain): Promise<number> {
    await this.connect(blockchain);
    if (!this.address)
      throw new Error(`Cannot connect to ${this.ui.name} wallet`);
    const amount = 10 ** blockchain.nativeDecimal;
    const config = new AptosConfig({ network: blockchain.chainId as Network });
    const client = new Aptos(config);
    await client.fundAccount({
      accountAddress: this.address,
      amount: amount,
      options: { waitForIndexer: false },
    });
    return amount / 10 ** blockchain.nativeDecimal;
  }

  public async deploy(
    blockchain: Blockchain,
    _abi: any, // we don't need ABI now
    bytecode: string,
    _args: any, // we don't need args now
    _extra: any // no extra data for current cases
  ): Promise<TxResponse> {
    // Connect wallet and prepare
    await this.connect(blockchain);
    const config = new AptosConfig({ network: blockchain.chainId as Network });
    const client = new Aptos(config);

    // Build deployment transaction
    const parsedBytecode = JSON.parse(bytecode) as AptosCompiledBytecode;
    const [metadataBytes, moduleBytes] = parsedBytecode.args;
    const tx = await client.publishPackageTransaction({
      account: AccountAddress.from(this.address!),
      metadataBytes: metadataBytes.value,
      moduleBytecode: moduleBytes.value,
    });

    // Sign deployment transaction
    const signingResult = await this.adapter!.features[
      "aptos:signTransaction"
    ]!.signTransaction(tx);
    if (signingResult.status === "Rejected")
      throw new Error("User rejected transaction");

    // Send signed deployment transaction to Aptos
    const submissionResult = await client.transaction.submit.simple({
      transaction: tx,
      senderAuthenticator: signingResult.args,
    });

    // Wait for transaction and extract contract modules
    const txResult = await client.waitForTransaction({
      transactionHash: submissionResult.hash,
    });
    return {
      txHash: submissionResult.hash,
      contractAddresses: txResult.changes
        .filter((change) => "address" in change)
        .map((change) => ({
          blockchainId: blockchain.id,
          address: change.address,
          module: change.type,
          publicity: false,
        })),
    };
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: `${string}::${string}`,
    _abi: any, // we don't need ABI now
    method: string,
    args: [
      Array<TypeArgument>,
      Array<EntryFunctionArgumentTypes | SimpleEntryFunctionArgumentTypes>
    ]
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const [typeParams, params] = args;
    const config = new AptosConfig({ network: blockchain.chainId as Network });
    const client = new Aptos(config);
    const result = await client.view({
      payload: {
        function: `${contractAddress}::${method}`,
        typeArguments: typeParams,
        functionArguments: params,
      },
    });
    return { data: JSON.stringify(JSON.parse(SuperJSON.stringify(result))) };
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: `${string}::${string}`,
    _abi: any, // we don't need ABI now
    method: string,
    args: [
      Array<TypeArgument>,
      Array<EntryFunctionArgumentTypes | SimpleEntryFunctionArgumentTypes>
    ],
    _extra: any // no extra data for current cases
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const [typeParams, params] = args;
    const result = await this.adapter!.features[
      "aptos:signAndSubmitTransaction"
    ]!.signAndSubmitTransaction({
      payload: {
        function: `${contractAddress}::${method}`,
        typeArguments: typeParams,
        functionArguments: params,
      },
    });
    if (result.status === "Rejected")
      throw new Error("User rejected transaction");
    return { txHash: result.args.hash };
  }
}

export class Petra extends AptosWallet {
  constructor() {
    super(
      "Petra",
      "data:image/png;base64,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",
      "https://chrome.google.com/webstore/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci",
      "#2f375fff",
      "#5a3fff"
    );
  }
}
