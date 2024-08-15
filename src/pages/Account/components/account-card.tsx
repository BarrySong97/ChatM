import { Card, CardBody } from "@nextui-org/react";
import type { Account as AccountCard } from "../../../../electron/db/schema";
import React, { FC } from "react";
import { useQuery } from "react-query";
import { MingcuteAlipayLine, RiWechatPayLine } from "@/assets/icon";
export interface AccountProps {
  data: AccountCard;
  onClick?: () => void;
}
const iconMap = {
  微信: <RiWechatPayLine />,
  支付宝: <MingcuteAlipayLine />,
} as const;
type MapKey = keyof typeof iconMap;

const AccountCard: FC<AccountProps> = ({ data, onClick }) => {
  return (
    <Card
      className="h-[130px]"
      isHoverable
      isPressable
      onClick={onClick}
      style={{
        backgroundColor: data.color ?? "",
      }}
      radius="sm"
    >
      <CardBody>
        <h3 className="text-white  font-medium">{data.title}</h3>
        <div className="text-white absolute right-4 bottom-4 text-3xl">
          {iconMap[data.title as MapKey]}
        </div>
      </CardBody>
    </Card>
  );
};

export default AccountCard;
