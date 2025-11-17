import { Flex, Space } from "antd";
import React, { memo } from "react";
import logo from "@assets/logo.png";
import { DOC_URL } from "@docs/index";
import { PRODUCT_NAME } from "@utils/constants";
import "./main-layout.scss";

const Logo: React.FC = memo(() => {
  return (
    <Flex
      align="center"
      justify="center"
      gap={8}
      className="profile-logo-container"
      onClick={() => window.open(DOC_URL)}
    >
      <img src={logo} className="profile-logo" alt={PRODUCT_NAME} />
      <Space align="baseline" size={3}>
        <div className="logo-title-left">KONTRAX</div>
        <div className="logo-title-right">HUB</div>
      </Space>
    </Flex>
  );
});

export default Logo;
