import { Form, Select } from "antd";
import React, { useEffect } from "react";
import { Blockchain, ContractAddress, NetworkCluster } from "@utils/constants";
import { useAppSelector } from "@redux/hook";
import { Wallet } from "@utils/wallets/wallet";
import { useForm } from "antd/es/form/Form";
import SelectOption from "@components/select-option";
import { useBlockchains } from "@hooks/blockchain";

const AbiWalletForm: React.FC<{
  defaultWallet?: string; // default wallet
  contractAddress?: ContractAddress; // default blockchain
  networkClusters: NetworkCluster[];
  onWalletSelected: (wallet: Wallet) => void;
  onBlockchainSelected: (blockchain: Blockchain) => void;
}> = ({
  defaultWallet,
  contractAddress,
  networkClusters,
  onWalletSelected,
  onBlockchainSelected,
}) => {
  const [form] = useForm();
  const { blockchains } = useBlockchains();
  const wallets = useAppSelector((state) => state.wallet.wallets);

  useEffect(() => {
    // Set default blockchain
    const selectedChain = contractAddress?.blockchainId
      ? blockchains.find((chain) => chain.id === contractAddress.blockchainId)
      : blockchains.find((chain) =>
          networkClusters.includes(chain.networkCluster)
        );
    if (selectedChain) {
      form.setFieldValue("blockchain", selectedChain.id);
      onBlockchainSelected(selectedChain);
    }

    // Set default wallet
    const wallet =
      defaultWallet && defaultWallet in wallets
        ? wallets[defaultWallet]
        : selectedChain
        ? Object.values(wallets).find(
            (w) => w.networkCluster === selectedChain.networkCluster
          )
        : Object.values(wallets).find((w) =>
            networkClusters.includes(w.networkCluster)
          );
    if (wallet) {
      form.setFieldValue("wallet", wallet.key);
      onWalletSelected(wallet);
    }
  }, [defaultWallet, contractAddress?.blockchainId, networkClusters, form]);

  return (
    <Form form={form} name="wallet-form" layout="horizontal">
      <Form.Item name="wallet" label="Wallet" required>
        <Select
          options={Object.values(wallets)
            .filter((wallet) => networkClusters.includes(wallet.networkCluster))
            .map((wallet) => ({
              label: wallet.ui.name,
              value: wallet.key,
              emoji: wallet.ui.icon,
            }))}
          optionRender={(option) => (
            <SelectOption icon={option.data.emoji} label={option.data.label} />
          )}
          onSelect={(walletKey: string) => onWalletSelected(wallets[walletKey])}
          labelRender={({ value, label }) =>
            value in wallets ? (
              <SelectOption icon={wallets[value].ui.icon} label={label} />
            ) : (
              label
            )
          }
        />
      </Form.Item>
      <Form.Item name="blockchain" label="Blockchain" required>
        <Select
          options={blockchains
            .filter((chain) => networkClusters.includes(chain.networkCluster))
            .map((chain) => ({
              label: chain.name,
              value: chain.id,
              emoji: chain.logo,
            }))}
          optionRender={(option) => (
            <SelectOption icon={option.data.emoji} label={option.data.label} />
          )}
          onSelect={(blockchainId: string) =>
            onBlockchainSelected(
              blockchains.find((chain) => chain.id === blockchainId)!
            )
          }
          disabled={contractAddress !== undefined}
          labelRender={({ value, label }) => {
            const selected = blockchains.find((c) => c.id === value);
            return selected ? (
              <SelectOption icon={selected.logo} label={label} />
            ) : (
              label
            );
          }}
        />
      </Form.Item>
    </Form>
  );
};

export default AbiWalletForm;
