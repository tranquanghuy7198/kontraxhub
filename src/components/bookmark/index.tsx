import React from "react";
import { Button } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import "./bookmark.scss";

interface BookmarkProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: { target: { checked: boolean } }) => void;
}

const Bookmark: React.FC<BookmarkProps> = ({
  checked,
  defaultChecked = false,
  onChange,
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : internalChecked;

  return (
    <Button
      type="text"
      shape="circle"
      size="small"
      icon={value ? <StarFilled className="bookmark" /> : <StarOutlined />}
      onClick={() => {
        const newValue = !value;
        if (!isControlled) setInternalChecked(newValue);
        onChange?.({ target: { checked: newValue } });
      }}
    />
  );
};

export default Bookmark;
