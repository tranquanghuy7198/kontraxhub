import { Flex, Image, Space } from "antd";
import React from "react";
import logo from "@assets/logo.png";
import { DOC_URL } from "@docs/index";
import "./main-layout.scss";

const Logo: React.FC = () => {
  return (
    <Flex
      align="center"
      justify="center"
      gap={8}
      className="profile-logo-container"
      onClick={() => window.open(DOC_URL)}
    >
      <Image src={logo} preview={false} className="profile-logo" />
      <Space align="baseline" size={3}>
        <div className="logo-title-left">KONTRAX</div>
        <div className="logo-title-right">HUB</div>
      </Space>
    </Flex>
  );
};

export default Logo;
