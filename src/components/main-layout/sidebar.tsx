import { memo } from "react";
import ProductContact from "@components/contact";
import Logo from "@components/main-layout/logo";
import { Menu, MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BLOCKCHAINS,
  MY_CONTRACTS,
  MY_TEMPLATES,
  POPULAR_CONTRACTS,
} from "@utils/routes";
import {
  AlignLeftOutlined,
  AppstoreFilled,
  SearchOutlined,
  StarFilled,
} from "@ant-design/icons";
import ProfileCard from "@components/profile-card";
import "./main-layout.scss";

type MenuItem = Required<MenuProps>["items"][number];

// NOTE: Keys should match with paths in App.tsx
const items: MenuItem[] = [
  {
    key: "/popular",
    label: "Popular",
    type: "group",
    children: [
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
    ],
  },
  {
    key: "/my-contracts",
    label: "My Contracts",
    type: "group",
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

const Sidebar: React.FC = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Logo />
      <Menu
        className="menu"
        selectedKeys={[location.pathname]}
        onSelect={({ key }) => navigate(key)}
        theme="light"
        mode="inline"
        items={items}
      />
      <ProfileCard />
      <ProductContact />
    </>
  );
});

export default Sidebar;
