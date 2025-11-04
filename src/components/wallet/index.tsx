import React, { useState } from "react";
import { Wallet } from "@utils/wallets/wallet";
import { Card, Image, Space, Tooltip } from "antd";
import { shorten } from "@utils/utils";
import useNotification from "antd/es/notification/useNotification";
import Paragraph from "antd/es/typography/Paragraph";
import { useFetchBlockchains } from "@hooks/blockchain";
import { useAppDispatch } from "@redux/hook";
import { updateWallet } from "@redux/reducers/wallet";
import "./wallet.scss";

const WalletCard: React.FC<{
  wallet: Wallet;
  onWalletUpdate: (wallet: Wallet) => Promise<void>;
}> = ({ wallet, onWalletUpdate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, contextHolder] = useNotification();
  const dispatch = useAppDispatch();
  const { blockchains } = useFetchBlockchains();

  const connectWallet = async (wallet: Wallet): Promise<void> => {
    try {
      setLoading(true);
      await wallet.connect();
      dispatch(updateWallet(wallet));
      await onWalletUpdate(wallet);
    } catch (error) {
      notification.error({
        message: `Cannot connect ${wallet.ui.name}`,
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {error instanceof Error ? error.message : String(error)}
          </Paragraph>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        hoverable
        className={`wallet-card ${loading ? "loading" : ""}`}
        size="small"
        onClick={() => connectWallet(wallet)}
        style={
          {
            "--wallet-bg": wallet.ui.backgroundColor,
            "--wallet-border": loading
              ? "transparent"
              : wallet.ui.backgroundColor,
          } as React.CSSProperties
        }
      >
        <div className="wallet-card-content">
          <Image className="wallet-logo" preview={false} src={wallet.ui.icon} />
          <div className="wallet-title">
            <div className="wallet-name">{wallet.ui.name}</div>
            <Space>
              {wallet.address && wallet.chainId && (
                <Tooltip
                  title={
                    blockchains.find(
                      (blockchain) =>
                        blockchain.chainId === wallet.chainId &&
                        blockchain.networkCluster === wallet.networkCluster
                    )?.name || `Unknown network (${wallet.chainId})`
                  }
                >
                  <Image
                    src={
                      blockchains.find(
                        (blockchain) =>
                          blockchain.chainId === wallet.chainId &&
                          blockchain.networkCluster === wallet.networkCluster
                      )?.logo
                    }
                    preview={false}
                    className="wallet-chain-logo"
                  />
                </Tooltip>
              )}
              <div
                className="wallet-info"
                style={{
                  color: wallet.address ? "black" : "#f5222d",
                }}
              >
                {wallet.address ? shorten(wallet.address) : "Not Connected"}
              </div>
            </Space>
          </div>
        </div>
      </Card>
    </>
  );
};

export default WalletCard;
