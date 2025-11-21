import {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Dropdown, Form, Input, MenuProps, Space } from "antd";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";
import { NamePath } from "antd/es/form/interface";
import { Wallet } from "@utils/wallets/wallet";
import { AbiAction, Blockchain, ContractAddress } from "@utils/constants";
import VSCodeEditor from "@components/vscode-editor";
import useNotification from "antd/es/notification/useNotification";

export enum AddressOption {
  Custom = "custom-value",
  Wallet = "wallet-address",
  Contract = "contract-address",
}

const items: MenuProps["items"] = [
  {
    key: AddressOption.Custom,
    label: "Custom Value",
  },
  {
    key: AddressOption.Wallet,
    label: "Wallet Address",
  },
  {
    key: AddressOption.Contract,
    label: "Contract Address",
  },
];

interface AbiFormInputProps {
  action: AbiAction;
  wallet?: Wallet;
  blockchain?: Blockchain;
  contractAddress?: ContractAddress;
  name: NamePath;
  label?: ReactNode;
  tooltip?: ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  defaultOption?: AddressOption;
  json: boolean;
  genDefaultJson?: () => any;
}

interface AbiFormInputRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string | undefined;
}

const AbiFormInput = forwardRef<AbiFormInputRef, AbiFormInputProps>(
  (
    {
      action,
      wallet,
      blockchain,
      contractAddress,
      name,
      label,
      tooltip,
      required,
      placeholder,
      disabled,
      defaultOption,
      json,
      genDefaultJson,
    },
    ref
  ) => {
    const [accType, setAccType] = useState<AddressOption>(AddressOption.Custom);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<any>(null);
    const form = Form.useFormInstance();
    const [notification, contextHolder] = useNotification();
    const isDisabled = disabled || loading;
    const defaultAddrOption = defaultOption || AddressOption.Custom;
    const possibleItems =
      action === AbiAction.Deploy
        ? items.filter((item) => item?.key !== AddressOption.Contract)
        : items;

    useEffect(() => {
      accTypeSelected([defaultAddrOption]);
    }, [defaultOption, wallet, blockchain, contractAddress]);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () =>
        inputRef.current?.getModel()?.setValue(inputRef.current?.getValue()),
      getValue: () => inputRef.current?.getValue(),
    }));

    const handleEditorChange = (value: string | undefined) => {
      form.setFields([{ name, value }]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setFields([{ name, value: e.target.value }]);
    };

    const accTypeSelected = async (keyPath: string[]) => {
      try {
        // Find auto-complete value
        if (keyPath.length === 0) return;
        setLoading(true);
        setAccType(keyPath[0] as AddressOption);
        let address = undefined;
        switch (keyPath[0]) {
          case AddressOption.Contract:
            if (!contractAddress)
              throw new Error("You must select a contract first");
            address = contractAddress.address;
            break;
          case AddressOption.Wallet:
            if (!wallet) throw new Error("You must select a wallet first");
            if (!blockchain)
              throw new Error("You must select a blockchain first");
            await wallet.connect(blockchain);
            address = wallet.address;
            break;
        }

        // Set the address value to the input
        form.setFields([{ name, value: address }]);
      } catch (e) {
        notification.error({
          message: "Input Calculation Failed",
          description: e instanceof Error ? e.message : String(e),
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        {contextHolder}
        <Form.Item
          name={name}
          tooltip={tooltip}
          label={label}
          required={required}
        >
          {json ? (
            <VSCodeEditor
              ref={inputRef}
              placeholder={placeholder}
              disabled={isDisabled}
              onChange={handleEditorChange}
              genActions={
                genDefaultJson
                  ? [
                      {
                        id: "gen-default-value",
                        label: "Generate Default Value",
                        generate: genDefaultJson,
                      },
                    ]
                  : undefined
              }
            />
          ) : (
            <Input
              ref={inputRef}
              placeholder={placeholder}
              disabled={isDisabled}
              onChange={handleInputChange}
              addonAfter={
                <Dropdown
                  trigger={["click"]}
                  disabled={isDisabled}
                  menu={{
                    selectable: true,
                    onClick: ({ keyPath }) =>
                      accTypeSelected(keyPath.reverse()),
                    defaultSelectedKeys: [defaultAddrOption],
                    items: possibleItems,
                  }}
                >
                  <Space
                    style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                  >
                    <>
                      {accType
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </>
                    {loading ? <LoadingOutlined /> : <DownOutlined />}
                  </Space>
                </Dropdown>
              }
            />
          )}
        </Form.Item>
      </>
    );
  }
);

export default AbiFormInput;
