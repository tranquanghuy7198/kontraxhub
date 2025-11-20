import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { Card, Space, Tooltip } from "antd";
import "./blockchain-card.scss";
import React, { memo } from "react";
import { Blockchain } from "@utils/constants";
import HoverCard from "@components/hover-card";

const BlockchainCard: React.FC<{
  blockchain: Blockchain;
  onEdit: () => void;
  onDelete: () => void;
}> = memo(({ blockchain, onEdit, onDelete }) => {
  const exportBlockchainData = () => {
    const blob = new Blob([JSON.stringify(blockchain, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blockchain.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HoverCard
      className="masonry-item"
      actions={[
        <a
          href={blockchain.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="blockchain-explorer"
        >
          <ExportOutlined />
        </a>,
        <DownloadOutlined onClick={exportBlockchainData} />,
        <EditOutlined onClick={onEdit} />,
        <DeleteOutlined onClick={onDelete} />,
      ]}
    >
      <Card.Meta
        avatar={
          <img
            className="blockchain-logo"
            src={blockchain.logo}
            alt={blockchain.name}
          />
        }
        title={
          <div className="blockchain-title">
            <div className="blockchain-name">{blockchain.name}</div>
            {!blockchain.isTestnet && (
              <Tooltip
                color="green"
                overlay={
                  <Space>
                    <>Mainnet</>
                    <CheckCircleOutlined />
                  </Space>
                }
              >
                <CheckCircleOutlined className="blockchain-mainnet" />
              </Tooltip>
            )}
          </div>
        }
        description={
          <div>
            <div>Chain ID: {blockchain.chainId}</div>
            <div>Token: {blockchain.nativeToken}</div>
            <div>Decimals: {blockchain.nativeDecimal}</div>
          </div>
        }
      />
    </HoverCard>
  );
});

export default BlockchainCard;
