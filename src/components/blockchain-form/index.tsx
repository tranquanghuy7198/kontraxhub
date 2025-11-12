import { capitalize } from "@utils/utils";
import {
  ADDRESS_PATTERN,
  Blockchain,
  CUSTOM_CHAIN_LOGO,
  NetworkCluster,
  networkClusterAddressRegex,
  networkClusterIcon,
  networkClusterTxRegex,
  TX_PATTERN,
} from "@utils/constants";
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import React, { useEffect } from "react";
import { v4 } from "uuid";
import SelectOption from "@components/select-option";
import { useBlockchains } from "@hooks/blockchain";
import useNotification from "antd/es/notification/useNotification";
import "./blockchain-form.scss";

const BlockchainForm: React.FC<{
  blockchainForm: { open: boolean; form?: Blockchain };
}> = ({ blockchainForm }) => {
  const [form] = useForm();
  const [notification, contextHolder] = useNotification();
  const { saveCustomBlockchain } = useBlockchains();
  const networkCluster = useWatch<NetworkCluster | undefined>(
    "networkCluster",
    form
  );

  useEffect(() => {
    if (blockchainForm.open) form.resetFields();
  }, [blockchainForm, form]);

  const saveBlockchain = (blockchain: Blockchain) => {
    // Fill auto fields
    const blockchainId = v4();
    blockchain.id = blockchainForm.form?.id ?? blockchainId;
    blockchain.globalId = blockchainForm.form?.globalId ?? blockchainId;
    blockchain.code = blockchainForm.form?.code ?? blockchain.chainId;
    blockchain.faucet = blockchainForm.form?.faucet ?? false;
    blockchain.logo = blockchainForm.form?.logo ?? CUSTOM_CHAIN_LOGO;
    blockchain.addressUrl =
      blockchainForm.form?.addressUrl ??
      blockchain.addressUrl.replace(
        networkClusterAddressRegex(blockchain.networkCluster),
        ADDRESS_PATTERN
      );
    blockchain.txUrl =
      blockchainForm.form?.txUrl ??
      blockchain.txUrl.replace(
        networkClusterTxRegex(blockchain.networkCluster),
        TX_PATTERN
      );

    // Save and notify
    saveCustomBlockchain(blockchain);
    notification.success({
      message: "Success",
      description: "Blockchain saved successfully.",
    });
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name="blockchain"
        layout="horizontal"
        initialValues={blockchainForm.form}
        autoComplete="off"
        onFinish={saveBlockchain}
      >
        <Form.Item name="networkCluster" label="Network Cluster" required>
          <Select
            placeholder="Network Cluster"
            options={Object.values(NetworkCluster).map((cluster) => ({
              value: cluster.toString(),
              label: capitalize(cluster.toString()),
            }))}
            optionRender={(option) => (
              <SelectOption
                icon={networkClusterIcon(option.data.value as NetworkCluster)}
                label={option.label}
              />
            )}
            labelRender={({ value, label }) => (
              <SelectOption
                icon={networkClusterIcon(value as NetworkCluster)}
                label={label}
              />
            )}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Name" name="name" required>
          <Input placeholder="Blockchain Name" />
        </Form.Item>
        <Form.Item
          label="Chain ID"
          name="chainId"
          required
          help={
            <div
              className="doc-link"
              onClick={() => window.open("https://chainlist.org/")}
            >
              Find chain ID at ChainList
            </div>
          }
        >
          <Input placeholder="Chain ID" />
        </Form.Item>
        <Form.Item
          label="RPC URL"
          name="rpcUrl"
          required
          help={
            <div
              className="doc-link"
              onClick={() => window.open("https://chainlist.org/")}
            >
              Find RPC URL at ChainList
            </div>
          }
        >
          <Input placeholder="RPC URL" />
        </Form.Item>
        <Form.Item label="Explorer URL" name="explorerUrl" required>
          <Input placeholder="Explorer URL" />
        </Form.Item>
        <Form.Item label="Address URL" name="addressUrl" required>
          <Input placeholder="Address URL" />
        </Form.Item>
        <Form.Item label="Transaction URL" name="txUrl" required>
          <Input placeholder="Transaction URL" />
        </Form.Item>
        <Form.Item label="Native Token" name="nativeToken" required>
          <Input placeholder="Native Token" />
        </Form.Item>
        <Form.Item label="Native Denom" name="nativeDenom" required>
          <Input placeholder="Native Denom" />
        </Form.Item>
        <Form.Item label="Native Decimal" name="nativeDecimal" required>
          <InputNumber placeholder="Native Decimal" />
        </Form.Item>
        <Form.Item
          label="Bech32 Prefix"
          name="bech32Prefix"
          tooltip="Only available for Cosmos-based blockchains"
        >
          <Input
            placeholder="Bech32 Prefix"
            disabled={networkCluster !== NetworkCluster.Cosmos}
          />
        </Form.Item>
        <Form.Item
          name="isTestnet"
          label="Testnet"
          valuePropName="checked"
          required
        >
          <Checkbox />
        </Form.Item>
        <Alert
          type="warning"
          showIcon
          message="Your customized blockchain is visible to you only."
          className="blockchain-warning"
        />
        <Button type="primary" htmlType="submit">
          Save Blockchain
        </Button>
      </Form>
    </>
  );
};

export default BlockchainForm;
