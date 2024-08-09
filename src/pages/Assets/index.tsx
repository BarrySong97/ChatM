import { Divider } from "@nextui-org/react";
import React, { Children, FC } from "react";
import FinancialItem from "../Index/components/metic-card";
import SectionCard from "../Index/components/SectionCard";
import { Tabs, TabsProps } from "antd";
export interface PageProps {}
const Page: FC<PageProps> = () => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "支出",
      children: <SectionCard />,
    },
    {
      key: "4",
      label: "负债",
      children: <SectionCard />,
    },
  ];
  return (
    <div className="px-12 py-8 mt-6  mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">资产/负债</h1>
        </div>
        {/* <Button onClick={onOpen} size="sm" color="primary">
          添加
        </Button> */}
      </div>
      <Divider className="my-6" />
      <div className="grid grid-cols-3 gap-4">
        <FinancialItem
          title="净资产"
          value={359.71}
          percentage={2.18}
          changed={1.32}
        />
        <FinancialItem
          title="总资产"
          value={35265}
          percentage={1.32}
          changed={1.32}
        />
        <FinancialItem
          title="总负债"
          value={458.96}
          percentage={-2.58}
          changed={-1.32}
        />
      </div>
      <div className="mt-8">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </div>
  );
};

export default Page;
