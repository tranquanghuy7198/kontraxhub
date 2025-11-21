import React, { memo } from "react";
import "./contract-template-card.scss";
import { ContractTemplate } from "@utils/constants";
import { Avatar, Flex, Space, Tooltip } from "antd";
import {
  CloudUploadOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldBinaryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import { useBlockchains } from "@hooks/blockchain";
import HoverCard from "@components/hover-card";

const ContractTemplateCard: React.FC<{
  contractTemplate: ContractTemplate;
  onDeploy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = memo(({ contractTemplate, onDeploy, onEdit, onDelete }) => {
  const { blockchains } = useBlockchains();

  return (
    <HoverCard
      className="masonry-item"
      actions={[
        <CloudUploadOutlined onClick={onDeploy} />,
        <EditOutlined onClick={onEdit} />,
        <DeleteOutlined onClick={onDelete} />,
      ]}
    >
      <Flex vertical gap={12}>
        <Flex align="center" justify="space-between">
          <div className="template-name">{contractTemplate.name}</div>
          <Avatar.Group
            size={30}
            max={{
              count: 4,
              style: {
                color: "#0077ffff",
                backgroundColor: "#c7e1ffff",
                fontSize: 14,
                fontWeight: "bold",
              },
            }}
          >
            {Array.from(
              new Map(
                blockchains
                  .filter(
                    (blockchain) =>
                      contractTemplate.networkClusters.includes(
                        blockchain.networkCluster
                      ) && !blockchain.isTestnet
                  )
                  .map((blockchain) => [blockchain.logo, blockchain])
              ).values()
            ).map((blockchain) => (
              <Avatar key={blockchain.id} src={blockchain.logo} />
            ))}
          </Avatar.Group>
        </Flex>
        <Flex vertical>
          {[
            {
              key: "abi",
              label: "ABI",
              value: JSON.stringify(contractTemplate.abi),
              icon: <FileTextOutlined />,
            },
            {
              key: "bytecode",
              label: "Bytecode",
              value: contractTemplate.bytecode,
              icon: <FieldBinaryOutlined />,
            },
            {
              key: "flattenSource",
              label: "Flatten Source",
              value: contractTemplate.flattenSource || "",
              icon: <CodeOutlined />,
            },
          ].map(({ key, label, value, icon }) => (
            <Paragraph key={key} copyable={{ text: value, tooltips: false }}>
              <Space>
                <a
                  href={URL.createObjectURL(
                    new Blob([value], { type: "text/plain" })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {icon} {label}
                </a>
              </Space>
            </Paragraph>
          ))}
        </Flex>
      </Flex>
    </HoverCard>
  );
});

export default ContractTemplateCard;
