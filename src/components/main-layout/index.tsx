import { Drawer, Flex, FloatButton, Layout, Space, Spin, Tag } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import React, { ReactNode, useState } from "react";
import WalletCard from "@components/wallet";
import { useAppSelector } from "@redux/hook";
import Sidebar from "@components/main-layout/sidebar";
import "./main-layout.scss";

const MainLayout: React.FC<{
  children: ReactNode;
  loading: boolean;
}> = ({ children, loading }) => {
  const wallets = useAppSelector((state) => state.wallet.wallets);
  const [connectWallet, setConnectWallet] = useState<boolean>(false);

  return (
    <Layout hasSider className="main-screen">
      <Layout.Sider className="left-area" width="auto" theme="light">
        <Sidebar />
      </Layout.Sider>
      <Layout>
        <Spin spinning={loading} size="large">
          <div className="page">{children}</div>
        </Spin>
      </Layout>
      <FloatButton
        className="float-btn"
        type="primary"
        icon={<WalletOutlined className="float-btn-icon" />}
        badge={{
          count: Object.values(wallets).filter(
            (wallet) => wallet.address != null
          ).length,
          color: "green",
        }}
        onClick={() => setConnectWallet(true)}
      />
      <Drawer
        width={500}
        title={
          <Space>
            <div>Select a Wallet</div>
            <Tag color="#0bd300ff">
              {
                Object.values(wallets).filter(
                  (wallet) => wallet.address != null
                ).length
              }{" "}
              connected
            </Tag>
          </Space>
        }
        open={connectWallet}
        closable={true}
        onClose={() => setConnectWallet(false)}
      >
        <Flex vertical gap={10} align="center" justify="stretch">
          {Object.entries(wallets).map(([key, wallet]) => (
            <WalletCard
              key={key}
              wallet={wallet}
              disabled={false}
              onWalletUpdate={async () => {}}
            />
          ))}
        </Flex>
      </Drawer>
    </Layout>
  );
};

export default MainLayout;
