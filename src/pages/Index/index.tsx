import PaperParse from "papaparse";
import {
  Button,
  ButtonGroup,
  Divider,
  Input,
  Kbd,
  Tooltip,
} from "@nextui-org/react";
import React, { FC, useEffect, useRef, useState } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsProps } from "antd";
import { useIndexData } from "@/api/hooks";
import Decimal from "decimal.js";
import { PageWrapper } from "@/components/PageWrapper";
import { AssetsSectionCard } from "@/components/IndexSectionCard/AssetsSectionCard";
import { IncomeSectionCard } from "@/components/IndexSectionCard/IncomeSectionCard";
import { LiabilitySectionCard } from "@/components/IndexSectionCard/LiabilitySectionCard";
import { ExpenseSectionCard } from "@/components/IndexSectionCard/ExpenseSectionCard";
import FinancialItem from "./components/metic-card";
import { seed } from "@/seed";
import {
  AppPathAtom,
  BookAtom,
  ShowCommandModalAtom,
  ShowTransactionModalAtom,
} from "@/globals";
import { BookService } from "@/api/services/BookService";
import TransactionModal from "@/components/TransactionModal";
import dayjs from "dayjs";
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
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "支出",
      children: <ExpenseSectionCard showDefaultTitle />,
    },
    {
      key: "2",
      label: "收入",
      children: <IncomeSectionCard showDefaultTitle />,
    },
    {
      key: "3",
      label: "资产",
      children: <AssetsSectionCard showDefaultTitle />,
    },
    {
      key: "4",
      label: "负债",
      children: <LiabilitySectionCard showDefaultTitle />,
    },
  ];
  const setAppPath = useSetAtom(AppPathAtom);
  useEffect(() => {
    window.ipcRenderer.invoke("get-app-path").then((path) => {
      setAppPath(path);
    });

    return () => {
      window.ipcRenderer.removeAllListeners("app-path");
    };
  }, []);

  const {
    assetsData,
    liabilitiesData,
    expenditureData,
    incomeData,
    netWorthData,
  } = useIndexData();

  const netWorth = new Decimal(assetsData?.totalAmount ?? 0).sub(
    liabilitiesData?.totalAmount ?? 0
  );
  const [book, setBook] = useAtom(BookAtom);
  const queryClient = useQueryClient();
  useEffect(() => {
    seed().then(async () => {
      if (!book?.id) {
        queryClient.invalidateQueries({ refetchActive: true });
        const book = await BookService.findDefault();
        setBook(book);
      }
    });
  }, []);
  const setShowTransactionModal = useSetAtom(ShowTransactionModalAtom);
  const setShowCommandModal = useSetAtom(ShowCommandModalAtom);
  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <Greeting />
          <DateDisplay />
        </div>
        <div className="flex gap-2 items-center">
          <Button
            endContent={<Kbd keys={["command"]}>K</Kbd>}
            size="sm"
            onClick={() => setShowCommandModal(true)}
            radius="sm"
            variant="flat"
          >
            查看快捷命令
          </Button>
          <Tooltip delay={300} radius="sm" content="快捷键 C">
            <Button
              color="primary"
              size="sm"
              radius="sm"
              variant="shadow"
              onClick={() => setShowTransactionModal(true)}
            >
              添加流水
            </Button>
          </Tooltip>
        </div>
      </div>
      <Divider className="my-8 bg-[#F0F0F0]" />
      <div className="flex gap-4 ">
        <div className="flex-1">
          <FinancialItem
            type="asset"
            chartData={
              netWorthData?.length
                ? netWorthData.map((item) => ({
                    label: item.date,
                    data: new Decimal(item.amount).toNumber(),
                  }))
                : [
                    {
                      label: dayjs().format("YYYY-MM-DD"),
                      data: netWorth.toNumber(),
                    },
                  ]
            }
            title="净资产"
            value={netWorth.toFixed(2)}
          />
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1">
          <FinancialItem
            type="asset"
            title="总资产"
            value={assetsData?.totalAmount ?? "0.00"}
          />
          <FinancialItem
            type="liability"
            title="总负债"
            value={
              liabilitiesData?.totalAmount
                ? `-${liabilitiesData?.totalAmount}`
                : "0.00"
            }
          />
          <FinancialItem
            type="income"
            title="总收入"
            value={incomeData?.totalAmount ?? "0.00"}
          />
          <FinancialItem
            type="expense"
            title="总支出"
            value={
              expenditureData?.totalAmount
                ? `-${expenditureData?.totalAmount}`
                : "0.00"
            }
          />
        </div>
      </div>
      <div className="mt-8">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </PageWrapper>
  );
};

export default Index;
