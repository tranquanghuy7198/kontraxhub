import React, { memo } from "react";
import {
  ContractAddress,
  CUSTOM_CHAIN_LOGO,
  DeployedContract,
} from "@utils/constants";
import { Flex, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import "@components/contract-card/contract-card.scss";
import { shorten } from "@utils/utils";
import Paragraph from "antd/es/typography/Paragraph";
import { useBlockchains } from "@hooks/blockchain";
import HoverCard from "@components/hover-card";

const ContractCard: React.FC<{
  contract: DeployedContract;
  onInteract: (address: ContractAddress) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}> = memo(({ contract, onInteract, onDelete, onEdit }) => {
  const { blockchains } = useBlockchains();

  const actions: React.ReactNode[] = [];
  if (onEdit) actions.push(<EditOutlined onClick={onEdit} />);
  if (onDelete) actions.push(<DeleteOutlined onClick={onDelete} />);

  return (
    <HoverCard className="masonry-item" actions={actions}>
      <Flex vertical justify="stretch" gap={5}>
        <div className="contract-name">{contract.template.name}</div>
        {contract.template.description && (
          <Paragraph
            className="description"
            ellipsis={{ rows: 4, expandable: true, symbol: "See more" }}
          >
            {contract.template.description}
          </Paragraph>
        )}
        <div>
          {contract.addresses.map((address) => {
            const blockchain = blockchains.find(
              (chain) => chain.id === address.blockchainId
            );
            return (
              <Flex
                key={`${address.blockchainId}-${address.address}-${address.module}`}
                align="center"
                gap={10}
                className="contract-address"
                onClick={() => onInteract(address)}
              >
                <Tooltip title={blockchain?.name ?? "Unknown blockchain"}>
                  <img
                    src={blockchain?.logo ?? CUSTOM_CHAIN_LOGO}
                    className={
                      blockchain?.isTestnet
                        ? "chain-icon-testnet"
                        : "chain-icon"
                    }
                  />
                </Tooltip>
                <a>
                  {address.module || shorten(address.address)}{" "}
                  <ExportOutlined />
                </a>
              </Flex>
            );
          })}
        </div>
      </Flex>
    </HoverCard>
  );
});

export default ContractCard;
