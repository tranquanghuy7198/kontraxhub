import { Layout, Spin } from "antd";
import React, { ReactNode } from "react";
import Sidebar from "@components/main-layout/sidebar";
import "./main-layout.scss";

const MainLayout: React.FC<{
  children: ReactNode;
  loading: boolean;
}> = ({ children, loading }) => {
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
    </Layout>
  );
};

export default MainLayout;
