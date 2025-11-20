import "@pages/blockchains/blockchains.scss";

import React, { useEffect, useState } from "react";
import BlockchainCard from "@components/chain-card";
import { Blockchain } from "@utils/constants";
import Header from "@components/header";
import { Drawer } from "antd";
import { XBlock, XMasonry } from "react-xmasonry";
import { useBlockchains } from "@hooks/blockchain";
import MainLayout from "@components/main-layout";
import BlockchainForm from "@components/blockchain-form";
import ConfirmModal from "@components/confirm-modal";

const TESTNET: string = "testnet";
const MAINNET: string = "mainnet";

const Blockchains: React.FC = () => {
  const { blockchains, deleteCustomBlockchain, blockchainLoading } =
    useBlockchains();
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
  const [deleteChainId, setDeleteChainId] = useState<string>();

  useEffect(() => {
    setDisplayedBlockchains(
      blockchains
        .filter((chain) => {
          if (
            searchedValue &&
            !chain.name.toLowerCase().includes(searchedValue.toLowerCase())
          )
            return false;
          if (!selectedValues.includes(chain.isTestnet ? TESTNET : MAINNET))
            return false;
          return true;
        })
        .sort((chainA, chainB) => chainA.code.localeCompare(chainB.code))
    );
  }, [blockchains, selectedValues, searchedValue]);

  const deleteChain = async () => {
    if (deleteChainId) await deleteCustomBlockchain(deleteChainId);
  };

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
                onDelete={() => setDeleteChainId(blockchain.id)}
              />
            </XBlock>
          ))}
        </XMasonry>
      </div>
      <Drawer
        width={500}
        title={chainForm.form ? chainForm.form.name : "Customize Blockchain"}
        open={chainForm.open}
        closable={true}
        onClose={() => setChainForm({ ...chainForm, open: false })}
      >
        <BlockchainForm blockchainForm={chainForm} />
      </Drawer>
      <ConfirmModal
        showModal={deleteChainId !== undefined}
        danger
        showButtons
        onOk={deleteChain}
        onCancel={() => setDeleteChainId(undefined)}
        title="Delete Customized Blockchain"
        okText="Delete"
        description="If this blockchain is your fully customized one, once you delete this, you cannot interact with your contracts associated with this blockchain. This action can not be undone. All customized information associated with this blockchain will be lost."
      />
    </MainLayout>
  );
};

export default Blockchains;
