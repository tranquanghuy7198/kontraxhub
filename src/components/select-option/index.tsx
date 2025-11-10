import { Flex } from "antd";
import React from "react";
import "./select-option.scss";

const SelectOption: React.FC<{ icon: string; label: React.ReactNode }> = ({
  icon,
  label,
}) => {
  return (
    <Flex align="center" gap="small">
      <img src={icon} className="chain-icon" />
      <div>{label}</div>
    </Flex>
  );
};

export default SelectOption;
