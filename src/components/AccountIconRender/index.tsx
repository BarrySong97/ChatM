import React from "react";
interface AccountIconRenderProps {
  icon: string;
  size?: string;
  emojiSize?: string;
  bankSize?: string;
}

const AccountIconRender: React.FC<AccountIconRenderProps> = ({
  icon,
  emojiSize = "1.1em",
}) => {
  const [iconType, iconId] = icon?.split(":") ?? [];

  if (iconType === "emoji") {
    return <em-emoji id={iconId} size={emojiSize}></em-emoji>;
  } else if (iconType === "bank") {
    return <img className={`h-4 w-4 inline-block`} src={iconId} alt="" />;
  }

  return null;
};

export default AccountIconRender;
