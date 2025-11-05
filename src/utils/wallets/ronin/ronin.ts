import { Wallet } from "@utils/wallets/wallet";
import RoninIcon from "@assets/wallets/ronin.svg";
import { Blockchain, NetworkCluster } from "@utils/constants";
import {
  ConnectorError,
  ConnectorErrorType,
  requestRoninWalletConnector,
  RoninWalletConnector,
} from "@sky-mavis/tanto-connect";
import { SiweMessage } from "siwe";
import { getAddress } from "ethers";

export class Ronin extends Wallet {
  public key: string = "RONIN";
  private connector: RoninWalletConnector | undefined;

  constructor() {
    super({
      ui: {
        name: "Ronin",
        icon: RoninIcon,
        backgroundColor: "#073164ff",
        titleColor: "#aff3ffff",
      },
      installLink: "https://wallet.roninchain.com",
      networkCluster: NetworkCluster.Ronin,
    });
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    try {
      this.connector = await requestRoninWalletConnector();
      const chainId = blockchain ? parseInt(blockchain.chainId, 16) : undefined;
      const connection = await this.connector.connect(chainId);
      this.address = connection.account;
      this.chainId =
        `0x${connection.chainId.toString(16)}` || blockchain?.chainId || "--";
    } catch (error) {
      if (error instanceof ConnectorError) {
        if (error.name === ConnectorErrorType.PROVIDER_NOT_FOUND)
          throw new Error(
            `Ronin is not detected in your browser. Install at ${this.installLink}`
          );
      }
      console.error(error);
      throw error;
    }
  }

  public async signMessage(
    message: string,
    nonce?: string,
    timestamp?: number,
    expiration?: number
  ): Promise<string> {
    await this.connect();
    const provider = await this.connector!.getProvider();
    const siweMessage = new SiweMessage({
      domain: window.location.hostname,
      uri: window.location.origin,
      address: getAddress(this.address!),
      version: "1",
      chainId: parseInt(this.chainId!, 16),
      nonce: nonce?.replaceAll("-", ""),
      issuedAt: timestamp ? new Date(timestamp).toISOString() : undefined,
      expirationTime: expiration
        ? new Date(expiration).toISOString()
        : undefined,
      statement: message.replaceAll("\n", ". "),
    });
    return await provider.request({
      method: "personal_sign",
      params: [siweMessage.toMessage(), this.address],
    });
  }
}
