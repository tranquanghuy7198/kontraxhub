import React, { lazy, Suspense } from "react";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { ConfigProvider, theme } from "antd";
import { PRIMARY_COLOR } from "@utils/constants";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  BLOCKCHAINS,
  MY_CONTRACTS,
  MY_TEMPLATES,
  POPULAR_CONTRACTS,
} from "@utils/routes";
import LoadingPage from "@pages/loading";

const Blockchains = lazy(() => import("@pages/blockchains"));
const TrendingContracts = lazy(() => import("@pages/trending-contracts"));
const ContractTemplates = lazy(() => import("@pages/contract-templates"));
const Contracts = lazy(() => import("@pages/contracts"));

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: PRIMARY_COLOR,
          colorLink: PRIMARY_COLOR,
          colorInfo: PRIMARY_COLOR,
        },
      }}
    >
      <Provider store={store}>
        <HashRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/" element={<Navigate to={BLOCKCHAINS} replace />} />
              <Route path={BLOCKCHAINS} element={<Blockchains />} />
              <Route path={POPULAR_CONTRACTS} element={<TrendingContracts />} />
              <Route path={MY_TEMPLATES} element={<ContractTemplates />} />
              <Route path={MY_CONTRACTS} element={<Contracts />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
