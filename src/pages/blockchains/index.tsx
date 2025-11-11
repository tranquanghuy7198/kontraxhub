import "@pages/blockchains/blockchains.scss";

import React, { useEffect, useState } from "react";
import BlockchainCard from "@components/chain-card";
import { Blockchain } from "@utils/constants";
import Header from "@components/header";
import { Drawer } from "antd";
import { XBlock, XMasonry } from "react-xmasonry";
import { useFetchBlockchains } from "@hooks/blockchain";
import MainLayout from "@components/main-layout";
import BlockchainForm from "@components/blockchain-form";

const TESTNET: string = "testnet";
const MAINNET: string = "mainnet";

const Blockchains: React.FC = () => {
  const { blockchains, blockchainLoading } = useFetchBlockchains();
  const [displayedBlockchains, setDisplayedBlockchains] = useState<
    Blockchain[]
  >([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([
    MAINNET,
    TESTNET,
  ]);
  const [searchedValue, setSearchedValue] = useState<string>();
  const [chainForm, setChainForm] = useState<{
    open: boolean;
    form?: Blockchain;
  }>({ open: false });

  useEffect(() => {
    setDisplayedBlockchains(
      blockchains.filter((chain) => {
        if (
          searchedValue &&
          !chain.name.toLowerCase().includes(searchedValue.toLowerCase())
        )
          return false;
        if (!selectedValues.includes(chain.isTestnet ? TESTNET : MAINNET))
          return false;
        return true;
      })
    );
  }, [blockchains, selectedValues, searchedValue]);

  return (
    <MainLayout loading={blockchainLoading}>
      <Header
        header="Blockchains"
        options={[
          { value: MAINNET, label: "Mainnet" },
          { value: TESTNET, label: "Testnet" },
        ]}
        onSelected={setSelectedValues}
        onSearched={setSearchedValue}
        onAddRequested={() => setChainForm({ open: true })}
        defaultSelectAll
      />
      <div className="masonry-container">
        <XMasonry center={false} targetBlockWidth={380}>
          {displayedBlockchains.map((blockchain) => (
            <XBlock key={blockchain.id}>
              <BlockchainCard
                blockchain={blockchain}
                onEdit={() => setChainForm({ open: true, form: blockchain })}
              />
            </XBlock>
          ))}
        </XMasonry>
      </div>
      <Drawer
        width={500}
        title={chainForm.form ? chainForm.form.name : "Add Blockchain"}
        open={chainForm.open}
        closable={true}
        onClose={() => setChainForm({ ...chainForm, open: false })}
      >
        <BlockchainForm blockchainForm={chainForm} />
      </Drawer>
    </MainLayout>
  );
};

export default Blockchains;
