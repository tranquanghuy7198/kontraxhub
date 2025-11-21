import { Image, Space } from "antd";
import React from "react";
import "./select-option.scss";

const SelectOption: React.FC<{ icon: string; label: React.ReactNode }> = ({
  icon,
  label,
}) => {
  return (
    <Space>
      <Image preview={false} src={icon} className="select-icon" />
      {label}
    </Space>
  );
};

export default SelectOption;
