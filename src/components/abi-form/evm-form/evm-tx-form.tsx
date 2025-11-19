import { Form, Input } from "antd";
import React, { useState } from "react";
import {
  EVM_PAYABLE_AMOUNT,
  funcSignature,
  genEvmDefaultParam,
  isComplex,
  paramKey,
} from "@components/abi-form/evm-form/utils";
import AbiFormInput from "@components/abi-form/abi-form-input";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  CopyStatus,
  NetworkCluster,
  TxResponse,
} from "@utils/constants";
import TransactionResult from "@components/abi-form/tx-response";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import ContractCallError from "@components/abi-form/contract-call-error";
import { EthereumExtra } from "@utils/wallets/ethereum/utils";
import { useAuth } from "@hooks/auth";
import { useFetchMyContracts } from "@hooks/contract";
import { addContractAddresses } from "@api/contracts";
import { JsonFragment } from "ethers";
import AbiFormAction from "@components/abi-form/abi-form-action";

const EvmTxForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  evmFunction: JsonFragment;
}> = ({
  action,
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  evmFunction,
}) => {
  const [evmAbiForm] = Form.useForm();
  const [notification, contextHolder] = useNotification();
  const [txResponse, setTxResponse] = useState<TxResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [copying, setCopying] = useState<CopyStatus>("copy");
  const { callAuthenticatedApi } = useAuth();
  const { fetchContracts } = useFetchMyContracts();

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain,
    parsedParams: any[],
    payableAmount?: string
  ): Promise<TxResponse> => {
    // Deploy
    const txResponse = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      parsedParams,
      { payment: payableAmount } as EthereumExtra
    );

    // Save deployed Etherem contract
    await callAuthenticatedApi(
      addContractAddresses,
      contractTemplate.id,
      txResponse.contractAddresses || []
    );
    await fetchContracts(true);

    return txResponse;
  };

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    parsedParams: any[]
  ): Promise<TxResponse | undefined> => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }

    return await wallet.readContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      funcName,
      parsedParams
    );
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    parsedParams: any[],
    payableAmount?: string
  ): Promise<TxResponse | undefined> => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }

    return await wallet.writeContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      funcName,
      parsedParams,
      { payment: payableAmount } as EthereumExtra
    );
  };

  const execute = async (params: Record<string, string>) => {
    // Check for necessary information
    if (!wallet) {
      notification.error({
        message: "No wallet selected",
        description: "You must select a wallet first",
      });
      return;
    }
    if (!blockchain) {
      notification.error({
        message: "No blockchain selected",
        description: "You must select a blockchain first",
      });
      return;
    }

    // Parse function params
    const payableAmount = params[EVM_PAYABLE_AMOUNT];
    const parsedParams = (evmFunction.inputs || []).map((param, paramIdx) => {
      const rawParam = params[paramKey(param, paramIdx)];
      if (isComplex(param.type)) return JSON.parse(rawParam);
      return rawParam;
    });

    // Pre-tx UI handling
    setLoading(true);
    setTxResponse(undefined);

    // Execute
    try {
      let response: TxResponse | undefined;
      if (action === AbiAction.Deploy)
        response = await deploy(
          wallet,
          blockchain,
          parsedParams,
          payableAmount
        );
      else if (action === AbiAction.Read)
        response = await read(
          wallet,
          blockchain,
          funcSignature(evmFunction),
          parsedParams
        );
      else if (action === AbiAction.Write)
        response = await write(
          wallet,
          blockchain,
          funcSignature(evmFunction),
          parsedParams,
          payableAmount
        );
      if (response) setTxResponse(response);
    } catch (e) {
      notification.error({
        message: "Execution Failed",
        description: <ContractCallError error={e} />,
      });
    }

    // Post-tx UI handling
    setLoading(false);
  };

  const copyTxBytecode = async () => {
    if (!wallet) {
      notification.error({
        message: "No wallet selected",
        description: "You must select a wallet first",
      });
      return;
    }
    if (!blockchain) {
      notification.error({
        message: "No blockchain selected",
        description: "You must select a blockchain first",
      });
      return;
    }
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }
    try {
      setCopying("copying");

      // Parse function params
      const params: Record<string, string> = evmAbiForm.getFieldsValue();
      const parsedParams = evmFunction.inputs?.map((param, paramIdx) => {
        const rawParam = params[paramKey(param, paramIdx)];
        if (isComplex(param.type)) return JSON.parse(rawParam);
        return rawParam;
      });

      // Calculate and copy tx bytecode
      const bytecode = await wallet.getTxBytecode(
        blockchain,
        contractAddress.address,
        contractTemplate.abi,
        funcSignature(evmFunction),
        parsedParams,
        null
      );
      navigator.clipboard.writeText(bytecode);
      setCopying("copied");
    } catch (error) {
      notification.error({
        message: "Copy Failed",
        description: <ContractCallError error={error} />,
      });
    } finally {
      setTimeout(() => setCopying("copy"), 2000);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={evmAbiForm}
        name={funcSignature(evmFunction)}
        layout="horizontal"
        autoComplete="off"
        onFinish={execute}
      >
        {evmFunction.inputs?.map((param, paramIdx) => (
          <AbiFormInput
            key={paramKey(param, paramIdx)}
            action={action}
            wallet={wallet}
            blockchain={blockchain}
            contractAddress={contractAddress}
            name={paramKey(param, paramIdx)}
            label={param.name}
            required
            placeholder={param.type}
            disabled={loading}
            json={isComplex(param.type)}
            genDefaultJson={() => genEvmDefaultParam(param)}
          />
        ))}
        {evmFunction.stateMutability === "payable" && (
          <Form.Item name={EVM_PAYABLE_AMOUNT} label="Payment" required>
            <Input
              placeholder={`${blockchain?.nativeDenom} amount to pay`}
              disabled={loading}
            />
          </Form.Item>
        )}
        <Form.Item>
          <AbiFormAction
            action={action}
            networkCluster={NetworkCluster.Evm}
            loading={loading}
            copying={copying}
            form={evmAbiForm}
            copyTxBytecode={copyTxBytecode}
          />
        </Form.Item>
      </Form>
      {txResponse && (
        <TransactionResult
          blockchain={blockchain}
          wallet={wallet}
          txResponse={txResponse}
        />
      )}
    </>
  );
};

export default EvmTxForm;
