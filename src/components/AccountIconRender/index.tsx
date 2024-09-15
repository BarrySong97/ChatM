import React from "react";
import {
  MingcuteAlipayFill,
  MingcuteWechatPayFill,
} from "../AccountModal/icon";
interface AccountIconRenderProps {
  icon: string;
  size?: string;
  emojiSize?: string;
  bankSize?: string;
  walletSize?: string;
}

const WalletIcon = {
  alipay: <MingcuteAlipayFill className="text-[#1677FF]" />,
  wechat: <MingcuteWechatPayFill className="text-[#1AAD19]" />,
};
const AccountIconRender: React.FC<AccountIconRenderProps> = ({
  icon,
  emojiSize = "1.1em",
  bankSize = "1rem",
  walletSize = "1.2rem",
}) => {
  const [iconType, iconId] = icon?.split(":") ?? [];

  let iconElement = null;
  if (iconType === "emoji") {
    iconElement = <em-emoji id={iconId} size={emojiSize}></em-emoji>;
  } else if (iconType === "bank") {
    iconElement = (
      <img
        className={` object-cover `}
        style={{
          height: bankSize,
          width: bankSize,
        }}
        src={iconId}
        alt=""
      />
    );
  } else if (iconType === "wallet") {
    iconElement = (
      <span
        style={{
          fontSize: walletSize,
        }}
      >
        {WalletIcon[iconId as keyof typeof WalletIcon]}
      </span>
    );
  }
  return iconElement ? (
    <div className="w-6 h-6 flex items-center justify-center">
      {iconElement}
    </div>
  ) : null;
};

export default AccountIconRender;
