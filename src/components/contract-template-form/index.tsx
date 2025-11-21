import { Alert, Button, Form, Input, Select } from "antd";
import { ContractTemplate, NetworkCluster } from "@utils/constants";
import { capitalize } from "@utils/utils";
import { useForm, useWatch } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import { v4 } from "uuid";
import { Keypair } from "@solana/web3.js";
import VSCodeEditor from "@components/vscode-editor";
import "./contract-template-form.scss";
import { DocType, docUrl } from "@docs/index";
import erc20Abi from "@utils/abi/evm/erc20.json";
import erc721Abi from "@utils/abi/evm/erc721.json";
import erc1155Abi from "@utils/abi/evm/erc1155.json";
import splTokenIdl from "@utils/abi/solana/spl.json";

export type ContractTemplateFormStructure = {
  id: string;
  name: string;
  desscription?: string;
  abi: string;
  bytecode: string;
  flattenSource?: string;
  programKeypair?: string;
  networkClusters: string[];
};

export const parseContractTemplateForm = (
  form: ContractTemplateFormStructure
): ContractTemplate => {
  return {
    id: form.id,
    name: form.name,
    description: form.desscription,
    abi: JSON.parse(form.abi),
    bytecode: form.bytecode,
    flattenSource: form.flattenSource,
    programKeypair: form.programKeypair
      ? (JSON.parse(form.programKeypair) as number[])
      : undefined,
    networkClusters: form.networkClusters.map(
      (cluster) => cluster as NetworkCluster
    ),
  };
};

const ContractTemplateForm: React.FC<{
  templateForm: {
    open: boolean;
    form?: ContractTemplateFormStructure;
  };
  saveContractTemplate: (
    template: ContractTemplateFormStructure
  ) => Promise<void>;
}> = ({ templateForm, saveContractTemplate }) => {
  const [form] = useForm();
  const networkClusters = useWatch<string[] | undefined>(
    "networkClusters",
    form
  );
  const [solanaProgramId, setSolanaProgramId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const cluster = (networkClusters?.at(0) ||
    NetworkCluster.Evm) as NetworkCluster;

  useEffect(() => {
    if (templateForm.open) form.resetFields();
    if (templateForm.form?.programKeypair)
      extractProgramId(templateForm.form.programKeypair);
  }, [form, templateForm]);

  const readBytecodeFile = async (bytecodeFile: File): Promise<boolean> => {
    const bytecodeBuffer: ArrayBuffer = await bytecodeFile.arrayBuffer();
    const bytecodeBytes = new Uint8Array(bytecodeBuffer);
    form.setFieldValue("bytecode", Buffer.from(bytecodeBytes).toString("hex"));
    return false;
  };

  const extractProgramId = (programKeypair: string) => {
    try {
      setSolanaProgramId(
        `Program ID: ${Keypair.fromSecretKey(
          Uint8Array.from(JSON.parse(programKeypair))
        ).publicKey.toBase58()}`
      );
    } catch (e) {
      setSolanaProgramId("");
    }
  };

  const saveTemplate = async (formValues: any) => {
    try {
      setLoading(true);
      await saveContractTemplate({
        ...formValues,
        id: templateForm.form?.id ?? v4(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      name="save-contract-template"
      layout="horizontal"
      initialValues={templateForm.form}
      autoComplete="off"
      onFinish={saveTemplate}
    >
      <Form.Item name="networkClusters" label="Network Clusters" required>
        <Select
          options={Object.values(NetworkCluster).map((cluster) => ({
            value: cluster.toString(),
            label: capitalize(cluster.toString()),
          }))}
          mode="multiple"
          disabled={loading}
          allowClear
        />
      </Form.Item>
      <Form.Item name="name" label="Name" required>
        <Input placeholder="Contract Name" disabled={loading} />
      </Form.Item>
      <Form.Item
        name="abi"
        label="ABI"
        required
        help={
          <div
            className="doc-link"
            onClick={() => window.open(docUrl(cluster, DocType.AbiBytecode))}
          >
            See how to generate {capitalize(cluster)} ABI
          </div>
        }
      >
        <VSCodeEditor
          placeholder="Contract ABI (EVM) or IDL (Solana)"
          disabled={loading}
          genActions={[
            {
              id: "gen-evm-erc20",
              label: "Generate ERC20 ABI",
              generate: () => erc20Abi,
            },
            {
              id: "gen-evm-erc721",
              label: "Generate ERC721 ABI",
              generate: () => erc721Abi,
            },
            {
              id: "gen-evm-erc1155",
              label: "Generate ERC1155 ABI",
              generate: () => erc1155Abi,
            },
            {
              id: "gen-solana-spl",
              label: "Generate SPL Token IDL",
              generate: () => splTokenIdl,
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="bytecode"
        label="Bytecode"
        required
        help={
          <div
            className="doc-link"
            onClick={() => window.open(docUrl(cluster, DocType.AbiBytecode))}
          >
            See how to generate {capitalize(cluster)} bytecode
          </div>
        }
      >
        <Input.TextArea
          placeholder="Contract bytecode"
          rows={4}
          disabled={loading}
        />
      </Form.Item>
      {(networkClusters || []).includes(NetworkCluster.Solana.toString()) && (
        <Form.Item name="bytecodeFile" label="Bytecode File">
          <Dragger
            name="bytecodeFile"
            multiple={false}
            accept=".so"
            beforeUpload={(file) => readBytecodeFile(file)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag .so file to this area to upload
            </p>
            <p className="ant-upload-hint">Support Solana .so files only.</p>
          </Dragger>
        </Form.Item>
      )}
      {(networkClusters || []).includes(NetworkCluster.Solana.toString()) && (
        <>
          <Form.Item name="programKeypair" label="Program Keypair" required>
            <Input.TextArea
              placeholder="[1, 2, 151, ...]"
              rows={2}
              onChange={(event) => extractProgramId(event.target.value)}
            />
          </Form.Item>
          <Alert
            showIcon
            type={solanaProgramId ? "info" : "error"}
            message={solanaProgramId || "Invalid program keypair"}
            className="solana-program-keypair-alert"
          />
        </>
      )}
      {(networkClusters || []).some((networkCluster) =>
        [NetworkCluster.Evm, NetworkCluster.Ronin]
          .map((cluster) => cluster.toString())
          .includes(networkCluster)
      ) && (
        <Form.Item name="flattenSource" label="Flatten Source">
          <Input.TextArea rows={4} placeholder="Contract flatten source" />
        </Form.Item>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Template
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContractTemplateForm;
