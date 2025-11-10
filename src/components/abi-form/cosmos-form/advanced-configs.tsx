import {
  CaretRightOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Flex, Form, Input, Select, Space } from "antd";
import React from "react";
import {
  ACCESS_TYPE,
  ACCESS_LIST,
  ADMIN,
  CODE_ID,
  COSMOS_ADVANCED_CONFIGS,
} from "@components/abi-form/cosmos-form/utils";
import { Wallet } from "@utils/wallets/wallet";
import { AbiAction, Blockchain } from "@utils/constants";
import AbiFormInput, {
  AddressOption,
} from "@components/abi-form/abi-form-input";
import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";
import { parseScreemingSnake } from "@utils/utils";
import "./cosmos-form.scss";

const AdvancedCosmosConfigs: React.FC<{
  wallet?: Wallet;
  blockchain?: Blockchain;
  disabled: boolean;
}> = ({ wallet, blockchain, disabled }) => {
  const cosmosAbiForm = Form.useFormInstance();
  const accessType = Form.useWatch<AccessType>(
    [COSMOS_ADVANCED_CONFIGS, ACCESS_TYPE],
    cosmosAbiForm
  );
  const codeId = Form.useWatch<string>(
    [COSMOS_ADVANCED_CONFIGS, CODE_ID],
    cosmosAbiForm
  );

  return (
    <Collapse
      bordered={false}
      defaultActiveKey={[]}
      size="small"
      className="advanced-configs"
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      items={[
        {
          key: "1",
          label: "Advanced Configs",
          children: (
            <>
              <Form.Item
                name={[COSMOS_ADVANCED_CONFIGS, CODE_ID]}
                label="Code ID"
                tooltip="Use an available code ID to instantiate the contract instead of uploading bytecode again"
              >
                <Input
                  placeholder="Use available code ID"
                  disabled={disabled}
                />
              </Form.Item>
              <AbiFormInput
                action={AbiAction.Deploy}
                wallet={wallet}
                blockchain={blockchain}
                name={[COSMOS_ADVANCED_CONFIGS, ADMIN]}
                label="Admin"
                tooltip="Specify an admin to upgrade this contract later. If not specified, contract cannot be upgraded in the future"
                required={false}
                placeholder="Upgrade authorized admin"
                disabled={disabled}
                defaultOption={AddressOption.Wallet}
                json={false}
              />
              {!codeId && (
                <Form.Item
                  name={[COSMOS_ADVANCED_CONFIGS, ACCESS_TYPE]}
                  label="Access Type"
                  tooltip="People who are allowed to instantiate a new contract from your uploaded bytecode. Only available when you upload a new bytecode"
                >
                  <Select
                    disabled={disabled}
                    placeholder="Instantiation authority"
                    options={Object.entries(AccessType)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => ({
                        label: parseScreemingSnake(key),
                        value: value,
                        disabled:
                          value === AccessType.ACCESS_TYPE_UNSPECIFIED ||
                          value === AccessType.UNRECOGNIZED,
                      }))}
                  />
                </Form.Item>
              )}
              {!codeId &&
                accessType === AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES && (
                  <Form.Item label="Instantiators">
                    <Form.List name={[COSMOS_ADVANCED_CONFIGS, ACCESS_LIST]}>
                      {(fields, { add, remove }) => (
                        <Flex vertical align="stretch">
                          {fields.map((field, index) => (
                            <Space key={field.key} align="baseline">
                              <Form.Item name={field.name}>
                                <Input
                                  placeholder={`Instantiator ${index + 1}`}
                                  disabled={disabled}
                                />
                              </Form.Item>
                              <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => remove(field.name)}
                              />
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            block
                            icon={<PlusOutlined />}
                            onClick={() => add()}
                          >
                            Add Instantiator
                          </Button>
                        </Flex>
                      )}
                    </Form.List>
                  </Form.Item>
                )}
            </>
          ),
        },
      ]}
    />
  );
};

export default AdvancedCosmosConfigs;
