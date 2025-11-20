import { Card, CardProps } from "antd";
import React from "react";
import classNames from "classnames";
import "./hover-card.scss";

const HoverCard: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <Card hoverable className={classNames("hover-card", className)} {...props}>
      {children}
    </Card>
  );
};

export default HoverCard;
