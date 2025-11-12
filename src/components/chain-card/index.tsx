import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { Card, Tooltip } from "antd";
import "./blockchain-card.scss";
import React, { memo } from "react";
import { Blockchain } from "@utils/constants";

const BlockchainCard: React.FC<{
  blockchain: Blockchain;
  onEdit: () => void;
  onDelete: () => void;
}> = memo(({ blockchain, onEdit, onDelete }) => {
  return (
    <Card
      className="masonry-item"
      hoverable
      actions={[
        <Tooltip title="Go to Explorer">
          <a
            href={blockchain.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="blockchain-explorer"
          >
            <ExportOutlined />
          </a>
        </Tooltip>,
        <Tooltip title="Edit">
          <EditOutlined onClick={onEdit} />
        </Tooltip>,
        <Tooltip title="Delete">
          <DeleteOutlined onClick={onDelete} />
        </Tooltip>,
      ]}
    >
      <div className="blockchain-card-content">
        <img className="blockchain-logo" src={blockchain.logo} />
        <div>
          <div className="blockchain-title">
            <div className="blockchain-name">{blockchain.name}</div>
            {!blockchain.isTestnet && (
              <Tooltip
                overlay={
                  <div>
                    Mainnet <CheckCircleOutlined />
                  </div>
                }
                color="green"
              >
                <CheckCircleOutlined className="blockchain-mainnet" />
              </Tooltip>
            )}
          </div>
          <div className="description">
            <div>Chain ID: {blockchain.chainId}</div>
            <div>Token: {blockchain.nativeToken}</div>
            <div>Decimals: {blockchain.nativeDecimal}</div>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default BlockchainCard;
