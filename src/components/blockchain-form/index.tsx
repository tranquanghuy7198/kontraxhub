import { capitalize } from "@utils/utils";
import {
  Blockchain,
  NetworkCluster,
  networkClusterIcon,
} from "@utils/constants";
import { Button, Checkbox, Form, Input, InputNumber, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect } from "react";
import { v4 } from "uuid";
import SelectOption from "../select-option";

const BlockchainForm: React.FC<{
  blockchainForm: { open: boolean; form?: Blockchain };
}> = ({ blockchainForm }) => {
  const [form] = useForm();

  const saveBlockchain = (blockchain: Blockchain) => {
    const blockchainId = v4();
    blockchain.id = blockchainId;
    blockchain.globalId = blockchainId;
    blockchain.code = blockchain.chainId;
    blockchain.faucet = false;

    // TODO
    blockchain.logo = "";
  };

  return (
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
      <Form.Item label="Chain ID" name="chainId" required>
        <Input placeholder="Chain ID" />
      </Form.Item>
      <Form.Item label="RPC URL" name="rpcUrl" required>
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
      <Form.Item label="Native Denom" name="netiveDenom" required>
        <Input placeholder="nativeDenom" />
      </Form.Item>
      <Form.Item label="Native Decimal" name="nativeDecimal" required>
        <InputNumber placeholder="Native Decimal" />
      </Form.Item>
      <Form.Item label="Bech32 Prefix" name="bech32Prefix">
        <Input placeholder="Bech32 Prefix" />
      </Form.Item>
      <Form.Item
        name="isTestnet"
        label="Testnet"
        valuePropName="checked"
        required
      >
        <Checkbox />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save Blockchain
      </Button>
    </Form>
  );
};

export default BlockchainForm;
