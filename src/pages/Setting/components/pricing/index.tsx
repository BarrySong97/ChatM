import { Button, Card, Divider } from "@nextui-org/react";
import React, { FC } from "react";
import { MaterialSymbolsCancel, PhCheckCircleFill } from "./icon";
import SettingWrapper from "../setting-wrapper";

interface Feature {
  name: string;
  value: string | boolean;
  enable?: boolean;
}

interface PricingItemProps {
  title: string;
  price: string;
  isPopular?: boolean;
  features: Feature[];
  isFree?: boolean;
}

const PricingItem: FC<PricingItemProps> = ({
  title,
  price,
  isPopular,
  features,
  isFree,
}) => {
  return (
    <Card shadow="sm" className={`mx-1 p-6  flex-1 `}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-4">
        ${price}
        <span className="text-sm font-normal text-gray-500">/永久</span>
      </p>
      <Button color="primary" className="mb-4" isDisabled={isFree}>
        {isFree ? "开始使用" : "在测试期间免费使用"}
      </Button>

      <div className="space-y-3 text-sm">
        {features.map((feature, index) => (
          <p key={index}>
            <div className="flex items-center">
              {feature.enable ? (
                <PhCheckCircleFill className="text-xl text-green-500" />
              ) : (
                <MaterialSymbolsCancel className="text-xl text-red-500" />
              )}
              <div className="ml-2 text-sm">{feature.name}</div>
            </div>
          </p>
        ))}
      </div>
    </Card>
  );
};

const Pricing: FC = () => {
  const freeFeatures: Feature[] = [
    { name: "emoji图标", value: "450,000 / 每次", enable: true },
    { name: "导出/导入", value: "约 900 条", enable: true },
    { name: "持续更新", value: "约 900 条", enable: true },
    { name: "自定义云同步", value: "约 900 条", enable: true },
    { name: "图表图片导出", value: "约 900 条", enable: false },
    { name: "AI 自动分类", value: "约 900 条", enable: false },
    { name: "多账本", value: "约 900 条", enable: false },
  ];

  const basicFeatures: Feature[] = [
    { name: "emoji图标", value: "450,000 / 每次", enable: true },
    { name: "导出/导入", value: "约 900 条", enable: true },
    { name: "持续更新", value: "约 900 条", enable: true },
    { name: "自定义云同步", value: "约 900 条", enable: true },
    { name: "图表图片导出", value: "约 900 条", enable: true },
    { name: "AI 自动分类", value: "约 900 条", enable: true },
    { name: "多账本", value: "约 900 条", enable: true },
  ];

  return (
    <SettingWrapper title="定价">
      <div className="flex gap-4">
        <PricingItem
          isFree={true}
          title="免费版"
          price="0"
          features={freeFeatures}
        />
        <PricingItem
          isPopular
          title="永久会员"
          price="待定"
          features={basicFeatures}
        />
      </div>
    </SettingWrapper>
  );
};

export default Pricing;
