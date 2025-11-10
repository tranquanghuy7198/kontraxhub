import { Space, Typography } from "antd";
import React from "react";
import { shorten } from "@utils/utils";
import { ADDRESS_PATTERN, Blockchain } from "@utils/constants";
import { ExportOutlined } from "@ant-design/icons";
import "./abi-form.scss";

const AbiTitle: React.FC<{
  name: string;
  address: string;
  module?: string;
  blockchain?: Blockchain;
}> = ({ name, address, module, blockchain }) => {
  return (
    <Space>
      {name}
      <img className="chain-icon" src={blockchain?.logo} />
      <a
        href={blockchain?.addressUrl?.replaceAll(ADDRESS_PATTERN, address)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {module || shorten(address)} <ExportOutlined />
      </a>
      <Typography.Text copyable={{ text: address }} />
    </Space>
  );
};

export default AbiTitle;
