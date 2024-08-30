import React from "react";
import {
  Button,
  Listbox,
  ListboxItem,
  Tooltip,
  Input,
  DatePicker,
} from "@nextui-org/react";
import { Popover } from "antd";
import { MaterialSymbolsArrowForwardIosRounded } from "@/assets/icon";
import { FinancialOperation } from "@/api/db/manager";
import { operationTranslations } from "../contant";
import { Asset, Expense, Income, Liability } from "@db/schema";
import { parseDate } from "@internationalized/date";

export interface TransactionsFilterProps {
  selectedTypes: Set<string>;
  setSelectedTypes: (types: Set<string>) => void;
  selectedSource: Set<string>;
  setSelectedSource: (source: Set<string>) => void;
  minAmount?: number;
  setMinAmount: (amount: number) => void;
  maxAmount?: number;
  setMaxAmount: (amount: number) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  incomes?: Income[];
  expenses?: Expense[];
  assets?: Asset[];
  liabilities?: Liability[];
}

const TransactionsFilter: React.FC<TransactionsFilterProps> = ({
  selectedTypes,
  setSelectedTypes,
  selectedSource,
  setSelectedSource,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  incomes,
  expenses,
  assets,
  liabilities,
}) => {
  const filterItems = [
    {
      label: "类型",
      content: (
        <Listbox
          aria-label="Transaction types"
          variant="flat"
          selectedKeys={selectedTypes}
          selectionMode="multiple"
          onSelectionChange={(keys) => {
            setSelectedTypes(keys as Set<string>);
          }}
        >
          {Object.values(FinancialOperation).map((type) => (
            <ListboxItem key={type}>{operationTranslations[type]}</ListboxItem>
          ))}
        </Listbox>
      ),
    },
    {
      label: "账户",
      content: (
        <div className="w-[100px] overflow-auto scrollbar">
          <Listbox
            aria-label="Source selection"
            variant="flat"
            selectionMode="none"
          >
            {[
              { key: "assets", label: "资产", data: assets },
              { key: "liability", label: "负债", data: liabilities },
              {
                key: "income",
                label: operationTranslations[FinancialOperation.Income],
                data: incomes,
              },
              {
                key: "expenditure",
                label: operationTranslations[FinancialOperation.Expenditure],
                data: expenses,
              },
            ].map(({ key, label, data }) => (
              <ListboxItem key={key}>
                <Popover
                  placement="rightTop"
                  arrow={false}
                  overlayInnerStyle={{
                    marginLeft: 12,
                  }}
                  content={
                    <Listbox
                      aria-label="Single selection example"
                      variant="flat"
                      selectedKeys={selectedSource}
                      onSelectionChange={(keys) => {
                        setSelectedSource(keys as Set<string>);
                      }}
                      selectionMode="multiple"
                    >
                      {data?.map((item) => (
                        <ListboxItem key={item.id}>{item.name}</ListboxItem>
                      )) ?? []}
                    </Listbox>
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>{label}</div>
                    <MaterialSymbolsArrowForwardIosRounded />
                  </div>
                </Popover>
              </ListboxItem>
            ))}
          </Listbox>
        </div>
      ),
    },
    {
      label: "金额",
      content: (
        <div className="p-2">
          <div className="flex flex-col gap-3">
            <Input
              type="number"
              placeholder="输入最小金额"
              size="sm"
              label="最小金额"
              value={minAmount?.toString() ?? ""}
              onValueChange={(e) => setMinAmount(Number(e))}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">¥</span>
                </div>
              }
            />
            <Input
              type="number"
              placeholder="输入最大金额"
              label="最大金额"
              size="sm"
              value={maxAmount?.toString() ?? ""}
              onValueChange={(e) => setMaxAmount(Number(e))}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">¥</span>
                </div>
              }
            />
          </div>
        </div>
      ),
    },
    // {
    //   label: "日期",
    //   content: (
    //     <div className="w-[240px] p-2 space-y-3">
    //       <DatePicker
    //         radius="sm"
    //         size="sm"
    //         value={
    //           startDate
    //             ? parseDate(startDate.toISOString().split("T")[0])
    //             : undefined
    //         }
    //         onChange={(e) => {
    //           setStartDate(new Date(e.toString()));
    //         }}
    //         showMonthAndYearPickers
    //         label="开始日期"
    //       />
    //       <DatePicker
    //         radius="sm"
    //         size="sm"
    //         showMonthAndYearPickers
    //         value={
    //           endDate
    //             ? parseDate(endDate.toISOString().split("T")[0])
    //             : undefined
    //         }
    //         onChange={(e) => {
    //           setEndDate(new Date(e.toString()));
    //         }}
    //         label="结束日期"
    //       />
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="">
      <Popover
        placement="rightTop"
        trigger="click"
        destroyTooltipOnHide
        content={
          <Listbox selectionMode="none" className="w-[80px] p-1">
            {filterItems.map((item) => (
              <ListboxItem key={item.label}>
                <Popover
                  arrow={false}
                  overlayInnerStyle={{
                    marginLeft: 12,
                  }}
                  mouseLeaveDelay={item.label !== "日期" ? undefined : 0.5}
                  placement="right"
                  content={item.content}
                >
                  <div className="flex items-center justify-between">
                    <div>{item.label}</div>
                    <MaterialSymbolsArrowForwardIosRounded />
                  </div>
                </Popover>
              </ListboxItem>
            ))}
          </Listbox>
        }
      >
        <Button radius="sm" size="sm" variant="flat">
          筛选
        </Button>
      </Popover>
    </div>
  );
};

export default TransactionsFilter;
