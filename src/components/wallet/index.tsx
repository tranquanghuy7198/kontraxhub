import React, { useState } from "react";
import { Wallet } from "@utils/wallets/wallet";
import { Card, Image } from "antd";
import { shorten } from "@utils/utils";
import useNotification from "antd/es/notification/useNotification";
import Paragraph from "antd/es/typography/Paragraph";
import { useAppDispatch } from "@redux/hook";
import { updateWallet } from "@redux/reducers/wallet";
import "./wallet.scss";

const WalletCard: React.FC<{
  wallet: Wallet;
  disabled: boolean;
  onWalletUpdate: (wallet: Wallet) => Promise<void>;
}> = ({ wallet, onWalletUpdate, disabled }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, contextHolder] = useNotification();
  const dispatch = useAppDispatch();

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
        className={`wallet-card ${loading ? "loading" : ""}  ${
          disabled ? "disabled" : ""
        }`}
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
            {wallet.address && (
              <div
                className="wallet-info"
                style={{ color: wallet.ui.titleColor }}
              >
                {shorten(wallet.address)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default WalletCard;
