import React, { memo } from "react";
import {
  ContractAddress,
  ContractTemplate,
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
  onInteract: (template: ContractTemplate, address: ContractAddress) => void;
  onDelete?: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
}> = memo(({ contract, onInteract, onDelete, onEdit }) => {
  const { blockchains } = useBlockchains();

  const actions: React.ReactNode[] = [];
  if (onEdit)
    actions.push(
      <Tooltip title="Edit">
        <EditOutlined onClick={() => onEdit(contract.template.id)} />
      </Tooltip>
    );
  if (onDelete)
    actions.push(
      <Tooltip title="Delete">
        <DeleteOutlined onClick={() => onDelete(contract.template.id)} />
      </Tooltip>
    );

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
                onClick={() => onInteract(contract.template, address)}
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
