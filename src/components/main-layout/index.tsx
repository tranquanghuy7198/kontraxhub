import {
  Drawer,
  Flex,
  FloatButton,
  Layout,
  Menu,
  MenuProps,
  Space,
  Spin,
  Tag,
} from "antd";
import {
  AlignLeftOutlined,
  AppstoreFilled,
  FileTextFilled,
  SearchOutlined,
  StarFilled,
  WalletOutlined,
} from "@ant-design/icons";
import React, { ReactNode, useState } from "react";
import WalletCard from "@components/wallet";
import { useAppSelector } from "@redux/hook";
import ProductContact from "@components/contact";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BLOCKCHAINS,
  MY_CONTRACTS,
  MY_TEMPLATES,
  POPULAR_CONTRACTS,
} from "@utils/routes";
import ProfileCard from "@components/profile-card";
import "./main-layout.scss";
import Logo from "@components/main-layout/logo";

type MenuItem = Required<MenuProps>["items"][number];

// NOTE: Keys should match with paths in App.tsx
const items: MenuItem[] = [
  {
    key: BLOCKCHAINS,
    label: "Blockchains",
    icon: <AppstoreFilled />,
  },
  {
    key: POPULAR_CONTRACTS,
    label: "Popular Contracts",
    icon: <StarFilled />,
  },
  {
    key: "/my-contracts",
    label: "My Contracts",
    icon: <FileTextFilled />,
    children: [
      {
        key: MY_TEMPLATES,
        label: "Contract Templates",
        icon: <AlignLeftOutlined />,
      },
      {
        key: MY_CONTRACTS,
        label: "Contract Explorer",
        icon: <SearchOutlined />,
      },
    ],
  },
  // {
  //   key: "settings",
  //   label: "Settings",
  //   icon: <SettingFilled />,
  // },
];

const MainLayout: React.FC<{
  children: ReactNode;
  loading: boolean;
}> = ({ children, loading }) => {
  const wallets = useAppSelector((state) => state.wallet.wallets);
  const navigate = useNavigate();
  const location = useLocation();
  const [connectWallet, setConnectWallet] = useState<boolean>(false);

  return (
    <Layout hasSider className="main-screen">
      <Layout.Sider className="left-area" width="auto" theme="light">
        <Logo />
        <Menu
          className="menu"
          defaultSelectedKeys={[location.pathname]}
          defaultOpenKeys={items
            .filter((item: any) =>
              item.children?.some(
                (subItem: any) => subItem.key === location.pathname
              )
            )
            .map((item) => item!.key as string)}
          onSelect={({ key }) => navigate(key)}
          theme="light"
          mode="inline"
          items={items}
        />
        <ProfileCard />
        <ProductContact />
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
