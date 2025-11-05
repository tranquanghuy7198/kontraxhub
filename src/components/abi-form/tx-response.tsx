import { Alert, Button, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Blockchain, TX_PATTERN, TxResponse } from "@utils/constants";
import { useAuth } from "@hooks/auth";
import { checkWalletStatus, linkWallet, requestChallenge } from "@api/auth";
import { shorten } from "@utils/utils";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import { LinkOutlined } from "@ant-design/icons";
import "./abi-form.scss";

const TransactionResult: React.FC<{
  blockchain?: Blockchain;
  wallet?: Wallet;
  txResponse: TxResponse;
  suggestLinking?: boolean;
}> = ({ blockchain, wallet, txResponse, suggestLinking = true }) => {
  const [notification, contextHolder] = useNotification();
  const { callAuthenticatedApi } = useAuth();
  const [linked, setLinked] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // If we don't want to show suggestion, do not bother users
    if (!suggestLinking) {
      setLinked(true);
      return;
    }

    // If we cannot detect wallet, do not bother users
    if (!wallet || !wallet.address) {
      setLinked(true);
      return;
    }

    // Check wallet linking status
    callAuthenticatedApi(
      checkWalletStatus,
      wallet.address,
      wallet.networkCluster
    ).then((linkStatus) => {
      if (linkStatus !== null) setLinked(linkStatus);
      else setLinked(true); // If we cannot detect linking status, do not bother users
    });
  }, [txResponse, suggestLinking]);

  const link = async () => {
    try {
      setLoading(true);
      if (!wallet) throw new Error(`Cannot connect wallet`);
      await wallet.connect(blockchain);
      const [timestamp, expiration, nonce, challenge] = await requestChallenge(
        wallet.verificationKey,
        wallet.chainId! // Chain ID must be available after connecting wallet
      );
      const signature = await wallet.signMessage(challenge, nonce);
      await callAuthenticatedApi(
        linkWallet,
        wallet.verificationKey,
        timestamp,
        nonce,
        signature,
        wallet.networkCluster
      );
      setLinked(true);
      notification.success({
        message: "Wallet connected",
        description: `Wallet ${shorten(
          wallet.address!
        )} has been successfully connected to your account`,
      });
    } catch (error) {
      notification.error({
        message: "Cannot connect wallet",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" className="tx-response">
      {contextHolder}
      <Alert
        type="info"
        className="tx-response"
        message={
          txResponse.data ??
          (txResponse.txHash && blockchain ? (
            <a
              target="_blank"
              href={blockchain.txUrl.replaceAll(TX_PATTERN, txResponse.txHash)}
            >
              {txResponse.txHash}
            </a>
          ) : (
            ""
          ))
        }
      />
      {wallet && wallet.address && !linked && (
        <Alert
          showIcon
          type="warning"
          message={
            <div>
              Wallet{" "}
              <Typography.Text code type="warning">
                {shorten(wallet.address)}
              </Typography.Text>{" "}
              is not connected to your account
            </div>
          }
          action={
            <Button
              type="primary"
              onClick={link}
              icon={<LinkOutlined />}
              loading={loading}
            >
              Connect
            </Button>
          }
        />
      )}
    </Space>
  );
};

export default TransactionResult;
