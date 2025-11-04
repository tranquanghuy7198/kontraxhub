import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Blockchain, NetworkCluster, TxResponse } from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import { AnchorProvider, Idl, Program, utils } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import SuperJSON from "superjson";
import { SolanaExtra } from "@utils/wallets/solana/utils";
import {
  BpfLoaderUpgradeable,
  buildDeploymentTxs,
  executeDeploymentTxs,
} from "solana-bpf";

class Solana extends Wallet {
  public provider: BaseMessageSignerWalletAdapter;

  constructor(
    provider: BaseMessageSignerWalletAdapter,
    backgroundColor: string,
    titleColor: string,
    installLink: string
  ) {
    super({
      ui: {
        name: provider.name,
        icon: provider.icon,
        backgroundColor: backgroundColor,
        titleColor: titleColor,
      },
      installLink: installLink,
      networkCluster: NetworkCluster.Solana,
    });
    this.provider = provider;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    if (
      !this.provider ||
      this.provider?.readyState === WalletReadyState.NotDetected
    )
      throw new Error(
        `${this.ui.name} is not detected in your browser. Install at ${this.installLink}`
      );
    await this.provider.connect();
    this.address = this.provider.publicKey?.toString();
    if (blockchain) this.chainId = blockchain.chainId;
  }

  public async signMessage(message: string): Promise<string> {
    await this.connect();
    const signature = await this.provider.signMessage(
      Buffer.from(message, "utf-8")
    );
    return utils.bytes.bs58.encode(signature);
  }

  public async faucet(blockchain: Blockchain): Promise<number> {
    await this.connect(blockchain);
    if (!this.address)
      throw new Error(`Cannot connect to ${this.ui.name} wallet`);
    const amount = 2 * LAMPORTS_PER_SOL;
    const connection = new Connection(blockchain.rpcUrl, "confirmed");
    await connection.requestAirdrop(new PublicKey(this.address), amount);
    return amount / LAMPORTS_PER_SOL;
  }

  public async deploy(
    blockchain: Blockchain,
    abi: any,
    bytecode: string,
    _args: any, // We don't need Solana args when deploying
    extra: SolanaExtra
  ): Promise<TxResponse> {
    // Prepare data
    await this.connect(blockchain);
    const connection = new Connection(blockchain.rpcUrl, "confirmed");
    const programKeypair = extra.programKeypair
      ? Keypair.fromSecretKey(Uint8Array.from(extra.programKeypair))
      : undefined;

    // Some initial validation
    const programId = new PublicKey((abi as Idl).address);
    const programExists = await connection.getAccountInfo(programId);
    const programBuffer = Buffer.from(bytecode, "hex");
    const bufferBalance = await connection.getMinimumBalanceForRentExemption(
      BpfLoaderUpgradeable.getBufferAccountSize(programBuffer.length)
    );
    const programBalance = await connection.getMinimumBalanceForRentExemption(
      BpfLoaderUpgradeable.getBufferAccountSize(
        BpfLoaderUpgradeable.BUFFER_PROGRAM_SIZE
      )
    );
    if (!programExists && !programKeypair)
      throw new Error("Program keypair is required for initial deployment");

    // Build all necessary transactions
    const recentBlockhash = await connection.getLatestBlockhash();
    const txs = buildDeploymentTxs(
      this.provider.publicKey!,
      programBuffer,
      programExists,
      bufferBalance,
      programBalance,
      recentBlockhash.blockhash,
      programId,
      programKeypair
    );

    // Sign and execute
    const signedTxs = await this.provider.signAllTransactions(txs);
    const txSignature = await executeDeploymentTxs(connection, signedTxs);
    return {
      contractAddresses: [
        {
          blockchainId: blockchain.id,
          address: programId.toBase58(),
          publicity: false,
        },
      ],
      txHash: txSignature,
    };
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: [any[], Record<string, PublicKey>]
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const [params, accounts] = args;
    const program = new Program(
      { ...abi, address: contractAddress } as Idl,
      new AnchorProvider(
        new Connection(blockchain.rpcUrl, "confirmed"),
        {
          publicKey: new PublicKey(this.address!),
          signTransaction: async () => {
            throw new Error();
          },
          signAllTransactions: async () => {
            throw new Error();
          },
        },
        { commitment: "confirmed" }
      )
    );
    const result = await program.methods[method](...params)
      .accounts(accounts)
      .view();
    return {
      data: JSON.stringify(JSON.parse(SuperJSON.stringify(result)).json),
    };
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: [any[], Record<string, PublicKey>],
    extra: SolanaExtra
  ): Promise<TxResponse> {
    // Prepare connection
    await this.connect(blockchain);
    const connection = new Connection(blockchain.rpcUrl, "confirmed");
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    // Prepare with program instruction
    const program = new Program(
      { ...abi, address: contractAddress } as Idl,
      this.provider as any
    );
    const [params, accounts] = args;
    const programInstruction = await program.methods[method](...params)
      .accounts(accounts)
      .remainingAccounts(extra.remainingAccounts || [])
      .instruction();

    // Prepare transaction
    const tx = new Transaction();
    for (const ix of extra.instructions)
      if (ix) tx.add(ix);
      else tx.add(programInstruction);

    // Send transaction
    const signature = await this.provider.sendTransaction(tx, connection);
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
      minContextSlot,
    });
    return { txHash: signature };
  }

  public async getTxBytecode(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any,
    extra: any
  ): Promise<string> {
    // Prepare connection
    await this.connect(blockchain);
    const connection = new Connection(blockchain.rpcUrl, "confirmed");
    const { blockhash } = await connection.getLatestBlockhash();

    // Prepare with program instruction
    const program = new Program(
      { ...abi, address: contractAddress } as Idl,
      this.provider as any
    );
    const [params, accounts] = args;
    const programInstruction = await program.methods[method](...params)
      .accounts(accounts)
      .remainingAccounts(extra.remainingAccounts || [])
      .instruction();

    // Prepare transaction
    const tx = new Transaction();
    for (const ix of extra.instructions)
      if (ix) tx.add(ix);
      else tx.add(programInstruction);
    tx.recentBlockhash = blockhash;
    tx.feePayer = new PublicKey(this.address!);

    // Return bytecode
    return utils.bytes.bs58.encode(tx.serializeMessage());
  }
}

export class Phantom extends Solana {
  public key: string = "PHANTOM";

  constructor() {
    super(
      new PhantomWalletAdapter(),
      "#3f2768ff",
      "#c3bbff",
      "https://phantom.com/download"
    );
  }
}

export class Solflare extends Solana {
  public key: string = "SOLFLARE";

  constructor() {
    super(
      new SolflareWalletAdapter(),
      "#3f3f00ff",
      "#fcef46",
      "https://www.solflare.com/download/"
    );
  }
}
