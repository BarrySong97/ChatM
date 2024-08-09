import { MaterialSymbolsSearch } from "@/assets/icon";
import PaperParse from "papaparse";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from "@nextui-org/react";
import React, { FC, useRef, useState } from "react";
import { Trend } from "./components/trend";
import { atom } from "jotai";
import { useQuery } from "react-query";
import { database } from "@/db";
import { useNavigate } from "react-router-dom";
import FinancialItem from "./components/metic-card";
import StockItem from "./components/category";
import { Tabs, TabsProps } from "antd";
import SectionCard from "./components/SectionCard";
import { Test } from "./components/test";
export const flowAtom = atom<"expense" | "income">("expense");
export interface IndexProps {}
const Greeting: React.FC = () => {
  const currentHour = new Date().getHours();
  let greeting = "早上好";

  if (currentHour >= 12 && currentHour < 18) {
    greeting = "中午好";
  } else if (currentHour >= 18 || currentHour < 6) {
    greeting = "晚上好";
  }

  return <h1 className="text-lg font-semibold">{greeting}</h1>;
};

const DateDisplay: React.FC = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("zh-cn", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return <p className="text-gray-500 text-sm">{formattedDate}</p>;
};

const Index: FC<IndexProps> = () => {
  const { data } = useQuery("accounts", {
    queryFn: async () => {
      return database.query.accounts.findMany();
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFile(file);
      PaperParse.parse(file, {
        complete(results, file) {
          navigate("/mapping", {
            state: { data: results.data },
          });
        },
      });
    }
  };
  const timeFilter = ["1月", "3月", "1年", "3年", "5年"];
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "支出",
      children: <SectionCard />,
    },
    {
      key: "2",
      label: "收入",
      children: (
        <Card className="block gap-8  mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0">
            <h3 className="font-semibold">支出</h3>
          </CardHeader>
          <CardBody className="flex-row gap- h-[300px]">
            <div className="space-y-4 w-[300px]">
              <StockItem
                title="NVDA"
                subtitle="Share Price"
                color="bg-purple-500"
              />
              <StockItem
                title="INTC"
                subtitle="Share Price"
                color="bg-yellow-500"
              />
              <StockItem
                title="INTC"
                subtitle="Share Price"
                color="bg-yellow-500"
              />
              <StockItem
                title="QCOM"
                subtitle="Share Price"
                color="bg-green-600"
              />
              <StockItem
                title="AMD"
                subtitle="Share Price"
                color="bg-red-600"
              />
              <StockItem
                title="AVGO"
                subtitle="Share Price"
                color="bg-pink-800"
              />
              <StockItem
                title="AVGO"
                subtitle="Share Price"
                color="bg-pink-800"
              />
            </div>
            <Trend />
          </CardBody>
        </Card>
      ),
    },
    {
      key: "3",
      label: "资产",
      children: (
        <Card className="block gap-8  mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0">
            <h3 className="font-semibold">支出</h3>
          </CardHeader>
          <CardBody className="flex-row gap- h-[300px]">
            <div className="space-y-4 w-[300px]">
              <StockItem
                title="NVDA"
                subtitle="Share Price"
                color="bg-purple-500"
              />
              <StockItem
                title="INTC"
                subtitle="Share Price"
                color="bg-yellow-500"
              />
              <StockItem
                title="INTC"
                subtitle="Share Price"
                color="bg-yellow-500"
              />
              <StockItem
                title="QCOM"
                subtitle="Share Price"
                color="bg-green-600"
              />
              <StockItem
                title="AMD"
                subtitle="Share Price"
                color="bg-red-600"
              />
              <StockItem
                title="AVGO"
                subtitle="Share Price"
                color="bg-pink-800"
              />
              <StockItem
                title="AVGO"
                subtitle="Share Price"
                color="bg-pink-800"
              />
            </div>
            <Trend />
          </CardBody>
        </Card>
      ),
    },
    {
      key: "4",
      label: "负债",
      children: (
        <Card className="block gap-8  mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0">
            <h3 className="font-semibold">支出</h3>
          </CardHeader>
          <CardBody className="flex-row gap-8 h-[300px]">
            <div className="space-y-4 w-[300px]">
              <StockItem
                title="NVDA"
                percent={2.18}
                amount={1.32}
                color="bg-purple-500"
              />
              <StockItem
                title="INTC"
                percent={2.18}
                amount={1.32}
                color="bg-yellow-500"
              />
              <StockItem
                title="INTC"
                percent={2.18}
                amount={1.32}
                color="bg-yellow-500"
              />
              <StockItem
                title="QCOM"
                color="bg-green-600"
                percent={2.18}
                amount={1.32}
              />
              <StockItem
                title="AMD"
                color="bg-red-600"
                percent={2.18}
                amount={1.32}
              />
              <StockItem
                title="AVGO"
                color="bg-pink-800"
                percent={2.18}
                amount={1.32}
              />
              <StockItem
                title="AVGO"
                color="bg-pink-800"
                percent={2.18}
                amount={1.32}
              />
            </div>
            <Trend />
          </CardBody>
        </Card>
      ),
    },
  ];

  return (
    <div className="px-12 py-8  mx-auto overflow-auto">
      <div className="flex justify-between items-end">
        <div>
          <Greeting />
          <DateDisplay />
        </div>
        <div className="flex items-center gap-2 ">
          <Input
            className="max-w-[200px] "
            radius="full"
            endContent={
              <MaterialSymbolsSearch className="text-gray-400 text-xl" />
            }
            placeholder="Search Transactions"
            size="sm"
            labelPlacement="outside"
          />
          <div>
            <input
              onChange={handleChange}
              ref={inputRef}
              id="file"
              type="file"
              className="hidden"
            />
            <Button onClick={handleClick} size="sm" color="primary">
              上传csv
            </Button>
          </div>
        </div>
      </div>
      <Divider className="my-8" />
      <div className="grid grid-cols-5 gap-4">
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
        <FinancialItem
          title="总收入"
          value={211.37}
          percentage={2.18}
          changed={1.32}
        />
        <FinancialItem
          title="总支出"
          value={211.37}
          percentage={2.18}
          changed={1.32}
        />
      </div>
      <div className="space-y-8 mt-8">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
      {/* <Test /> */}
    </div>
  );
};

export default Index;
