import { NetworkCluster } from "@utils/constants";
import { makeRequest } from "@api/utils";

export enum AuthMethod {
  Password = "password",
  RefreshToken = "refresh_token",
  Wallet = "wallet",
}

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export const refresh = async (refreshToken: string): Promise<AuthResponse> => {
  return await makeRequest("/token", "POST", {
    grant_type: AuthMethod.RefreshToken,
    refresh_token: refreshToken,
  });
};

export const requestChallenge = async (
  address: string,
  chainId: string
): Promise<[number, number, string, string]> => {
  const { timestamp, expiration, nonce, challenge } = await makeRequest(
    "/token/challenge",
    "POST",
    { address, chainId }
  );
  return [timestamp, expiration, nonce, challenge];
};

export const authWithWallet = async (
  address: string,
  chainId: string,
  timestamp: number,
  nonce: string,
  signature: string,
  networkCluster: NetworkCluster
): Promise<AuthResponse> => {
  return await makeRequest("/token", "POST", {
    grant_type: AuthMethod.Wallet,
    wallet_address: address,
    chain_id: chainId,
    timestamp,
    nonce,
    signature,
    network_cluster: networkCluster,
  });
};

export const checkWalletStatus = async (
  accessToken: string,
  address: string,
  networkCluster: NetworkCluster
): Promise<boolean> => {
  const { isLinked } = await makeRequest(
    `/token/link/wallet?address=${address}&networkCluster=${networkCluster}`,
    "GET",
    undefined,
    accessToken
  );
  return isLinked;
};

export const linkWallet = async (
  accessToken: string,
  address: string,
  timestamp: number,
  nonce: string,
  signature: string,
  networkCluster: NetworkCluster
) => {
  await makeRequest(
    "/token/link/wallet",
    "POST",
    { address, timestamp, nonce, signature, networkCluster },
    accessToken
  );
};
