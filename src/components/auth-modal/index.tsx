import { Flex, Image, Modal } from "antd";
import React, { useState } from "react";
import "./auth-modal.scss";

import { useAppSelector } from "@redux/hook";
import WalletCard from "@components/wallet";
import useLocalStorageState from "use-local-storage-state";
import { AUTH_KEY, Session } from "@hooks/auth";
import { Wallet } from "@utils/wallets/wallet";
import { authWithWallet, requestChallenge } from "@api/auth";
import { NetworkCluster, networkClusterIcon } from "@utils/constants";

const AuthModal: React.FC = () => {
  const wallets = useAppSelector((state) => state.wallet.wallets);
  const [selectedClusters, setSelectedClusters] = useState<NetworkCluster[]>(
    Object.values(NetworkCluster)
  );
  const [session, setSession] = useLocalStorageState<Session | null>(AUTH_KEY, {
    defaultValue: null,
  });

  const onWalletUpdate = async (wallet: Wallet) => {
    // Get challenge, sign and authenticate
    const key = wallet.verificationKey;
    const [timestamp, nonce, challenge] = await requestChallenge(key);
    const signature = await wallet.signMessage(challenge, nonce);
    const authResponse = await authWithWallet(
      key,
      timestamp,
      nonce,
      signature,
      wallet.networkCluster
    );

    // Save session
    setSession({
      accessToken: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      accessTokenExpires:
        Math.floor(Date.now() / 1000) + authResponse.expires_in,
    });
  };

  const filterCluster = (cluster: NetworkCluster) => {
    if (selectedClusters.includes(cluster))
      setSelectedClusters(selectedClusters.filter((c) => c !== cluster));
    else setSelectedClusters([...selectedClusters, cluster]);
  };

  return (
    <Modal centered open={!session} footer={null} width={450}>
      <Flex vertical gap={10} align="center" justify="stretch">
        <Flex vertical align="center" gap={10} className="auth-title">
          <div className="primary-title">Connect Wallet</div>
          <Flex vertical align="center" className="description">
            <div>A crypto wallet is required to proceed</div>
            <div>Please connect one to continue</div>
          </Flex>
        </Flex>
        {Object.entries(wallets).map(([key, wallet]) => (
          <WalletCard
            key={key}
            wallet={wallet}
            disabled={!selectedClusters.includes(wallet.networkCluster)}
            onWalletUpdate={onWalletUpdate}
          />
        ))}
        <Flex gap={5}>
          <div className="description cluster-filter">Filter by</div>
          {Object.values(NetworkCluster).map((networkCluster) => (
            <Image
              key={networkCluster}
              src={networkClusterIcon(networkCluster)}
              preview={false}
              onClick={() => filterCluster(networkCluster)}
              className={`chain-icon ${
                !selectedClusters.includes(networkCluster)
                  ? "disabled-cluster"
                  : ""
              }`}
            />
          ))}
        </Flex>
      </Flex>
    </Modal>
  );
};

export default AuthModal;
