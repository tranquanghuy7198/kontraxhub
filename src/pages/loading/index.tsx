import React from "react";
import { Layout } from "antd";
import logo from "@assets/logo.png";
import "./loading.scss";

const LoadingPage: React.FC = () => {
  return (
    <Layout className="loading-page">
      <div className="logo-container">
        <img src={logo} className="loading-logo" />
      </div>
    </Layout>
  );
};

export default LoadingPage;
