import { Drawer } from "antd";
import React from "react";
import AbiTitle from "@components/abi-form/abi-title";
import AbiForm from "@components/abi-form";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";

const ContractInteraction: React.FC<{
  open: boolean;
  defaultAction?: AbiAction;
  template?: ContractTemplate;
  address?: ContractAddress;
  blockchain?: Blockchain;
  onClose: () => void;
}> = ({ open, defaultAction, template, address, blockchain, onClose }) => {
  return (
    <Drawer
      width={700}
      title={
        template && address ? (
          <AbiTitle
            name={template.name}
            address={address.address}
            module={address.module}
            blockchain={blockchain}
          />
        ) : template ? (
          template.name
        ) : undefined
      }
      open={open}
      closable={true}
      onClose={onClose}
    >
      {template && (
        <AbiForm
          contractAddress={address}
          defaultAction={defaultAction || AbiAction.Read}
          contractTemplate={template}
        />
      )}
    </Drawer>
  );
};

export default ContractInteraction;
