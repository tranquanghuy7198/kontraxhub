import { Button, Flex, Image, Modal } from "antd";
import React from "react";
import "./confirm-modal.scss";

import AlertIcon from "@assets/ic_alert.png";
import InfoIcon from "@assets/ic_info.png";

const ConfirmModal: React.FC<{
  showModal: boolean;
  danger?: boolean;
  showButtons?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title: string;
  okText?: string;
  description: React.ReactNode;
}> = ({
  showModal,
  danger = false,
  showButtons = true,
  onOk = () => {},
  onCancel = () => {},
  title,
  okText = "OK",
  description,
}) => {
  return (
    <Modal
      centered
      open={showModal}
      footer={null}
      onCancel={onCancel}
      width={430}
    >
      <Flex vertical align="center" justify="stretch" gap={12}>
        <Image
          src={danger ? AlertIcon : InfoIcon}
          className="confirm-icon"
          preview={false}
        />
        <div className="primary-title">{title}</div>
        <div className="confirm-description">{description}</div>
        {showButtons && (
          <Button
            type="primary"
            block
            danger={danger}
            onClick={() => {
              onOk(); // Do action
              onCancel(); // Close the modal
            }}
          >
            {okText}
          </Button>
        )}
        {showButtons && (
          <Button block onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Flex>
    </Modal>
  );
};

export default ConfirmModal;
