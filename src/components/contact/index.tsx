import {
  DiscordFilled,
  GiftFilled,
  GoogleOutlined,
  LinkedinFilled,
} from "@ant-design/icons";
import React, { memo } from "react";
import "./contact.scss";

const ProductContact: React.FC = memo(() => {
  return (
    <div className="about-product">
      <DiscordFilled
        className="product-contact"
        onClick={() => window.open("https://discord.gg/pW8kw8JX7s")}
      />
      <LinkedinFilled
        className="product-contact"
        onClick={() =>
          window.open("https://www.linkedin.com/in/quang-huy-tran-93725a172/")
        }
      />
      <a href="mailto:tranquanghuy7198@gmail.com">
        <GoogleOutlined className="product-contact" />
      </a>
      <GiftFilled
        className="product-contact"
        onClick={() =>
          window.open("https://github.com/sponsors/tranquanghuy7198")
        }
      />
    </div>
  );
});

export default ProductContact;
