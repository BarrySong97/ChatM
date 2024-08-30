import React, { useState } from "react";
import {
  Input,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { SearchIcon, PlusIcon } from "./PluseIcon";
import TransactionsFilter from "./TransactionsFilter";
import { Tag, Popover as AntdPopover } from "antd";
import { FinancialOperation } from "@/api/db/manager";
import { operationColors, operationTranslations } from "../contant";
import dayjs from "dayjs";
import { MaterialSymbolsCalendarMonth } from "@/components/IndexSectionCard/icon";
import CommonDateRangeFilter from "@/components/CommonDateRangeFilter";
import { MaterialSymbolsArrowForwardIosRounded } from "@/assets/icon";
import AmountRangeFilter from "@/components/AmountRangeFilter";

export interface TopContentProps {
  filterValue: string;
  setFilterValue: (value: string) => void;
  selectedTypes: Set<string>;
  setSelectedTypes: (types: Set<string>) => void;
  selectedSource: Set<string>;
  setSelectedSource: (sources: Set<string>) => void;
  minAmount?: number;
  setMinAmount: (amount?: number) => void;
  maxAmount?: number;
  setMaxAmount: (amount?: number) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  filterConditions: "or" | "and";
  setFilterConditions: (conditions: "or" | "and") => void;
  incomes: any[];
  expenses: any[];
  assets: any[];
  liabilities: any[];
  totalCount: number;
  selectedRowsCount: number;
  visibleRowsCount: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const TopContent: React.FC<TopContentProps> = ({
  filterValue,
  setFilterValue,
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
  filterConditions,
  setFilterConditions,
  incomes,
  expenses,
  assets,
  liabilities,
  totalCount,
  selectedRowsCount,
  visibleRowsCount,
  onRowsPerPageChange,
}) => {
  const getName = (id: string) =>
    [assets, liabilities, expenses, incomes].map((item) => {
      return item?.find((item) => item.id === id)?.name;
    });

  const renderFilterConditions = () => {
    const types = Array.from(selectedTypes);
    const sources = Array.from(selectedSource);
    return (
      <div className="space-y-2">
        {types.map((type) => (
          <Tag
            key={type}
            bordered={false}
            closable
            onClose={() => {
              setSelectedTypes(new Set(types.filter((t) => t !== type)));
            }}
            color={operationColors[type as FinancialOperation]}
          >
            {operationTranslations[type as FinancialOperation]}
          </Tag>
        ))}
        {sources.map((source) => (
          <Tag
            key={source}
            closable
            onClose={() => {
              setSelectedSource(new Set(sources.filter((s) => s !== source)));
            }}
            bordered={false}
          >
            {getName(source)}
          </Tag>
        ))}
        {minAmount || maxAmount ? (
          <Tag
            onClose={() => {
              setMinAmount(undefined);
              setMaxAmount(undefined);
            }}
            closable
            bordered={false}
          >
            金额: {minAmount ? minAmount : "不限"} -{" "}
            {maxAmount ? maxAmount : "不限"}
          </Tag>
        ) : null}
        {startDate || endDate ? (
          <Tag
            closable
            onClose={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            bordered={false}
          >
            日期：{startDate ? dayjs(startDate).format("YYYY-MM-DD") : "不限"} -{" "}
            {endDate ? dayjs(endDate).format("YYYY-MM-DD") : "目前"}
          </Tag>
        ) : null}
      </div>
    );
  };

  const [showPopover, setShowPopover] = useState(false);
  const [month, setMonth] = useState<Date[]>();
  const formatDateRange = (start: Date, end: Date) => {
    return `${start.getFullYear()}/${String(start.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(start.getDate()).padStart(
      2,
      "0"
    )} - ${end.getFullYear()}/${String(end.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(end.getDate()).padStart(2, "0")}`;
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <div className="flex gap-3">
          <Input
            isClearable
            classNames={{
              base: "w-[300px]",
              inputWrapper: "border-1",
            }}
            placeholder="搜索流水内容"
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={(v) => setFilterValue(v)}
          />
          <div className="flex items-center gap-4">
            <AntdPopover
              trigger="click"
              content={
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
                    <ListboxItem key={type}>
                      {operationTranslations[type]}
                    </ListboxItem>
                  ))}
                </Listbox>
              }
              placement="bottom"
              showArrow
            >
              <Button size="sm" variant="flat" radius="sm">
                类型
              </Button>
            </AntdPopover>
            <AntdPopover
              trigger="click"
              content={
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
                        label:
                          operationTranslations[FinancialOperation.Expenditure],
                        data: expenses,
                      },
                    ].map(({ key, label, data }) => (
                      <ListboxItem key={key}>
                        <AntdPopover
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
                                <ListboxItem key={item.id}>
                                  {item.name}
                                </ListboxItem>
                              )) ?? []}
                            </Listbox>
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>{label}</div>
                            <MaterialSymbolsArrowForwardIosRounded />
                          </div>
                        </AntdPopover>
                      </ListboxItem>
                    ))}
                  </Listbox>
                </div>
              }
              placement="bottom"
              showArrow
            >
              <Button size="sm" variant="flat" radius="sm">
                账户
              </Button>
            </AntdPopover>
            <AntdPopover
              trigger="click"
              content={
                <AmountRangeFilter
                  onReset={() => {
                    setMinAmount(undefined);
                    setMaxAmount(undefined);
                  }}
                  minAmount={minAmount}
                  maxAmount={maxAmount}
                  setMinAmount={setMinAmount}
                  setMaxAmount={setMaxAmount}
                />
              }
              placement="bottom"
              showArrow
            >
              <Button size="sm" variant="flat" radius="sm">
                金额
              </Button>
            </AntdPopover>
            <AntdPopover
              trigger="click"
              content={
                <CommonDateRangeFilter
                  onReset={() => {
                    setShowPopover(false);
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  onChange={(value) => {
                    setStartDate(value.start);
                    setEndDate(value.end);
                    setShowPopover(false);
                  }}
                  value={{
                    start: startDate || null,
                    end: endDate || null,
                  }}
                />
              }
              placement="bottom"
              showArrow
            >
              <Button
                startContent={
                  <MaterialSymbolsCalendarMonth className="text-base" />
                }
                size="sm"
                variant="flat"
                radius="sm"
              >
                {month ? formatDateRange(month[0], month[1]) : "选择日期"}
              </Button>
            </AntdPopover>
            <div className="flex gap-0 items-center text-default-400 text-small">
              <div>满足</div>
              <select
                className="bg-transparent outline-none text-default-400 text-small"
                onChange={(e) => {
                  setFilterConditions(e.target.value as "and" | "or");
                }}
                value={filterConditions}
              >
                <option value="and">所有</option>
                <option value="or">任一</option>
              </select>
              <div>条件</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-foreground text-background"
            endContent={<PlusIcon />}
            size="sm"
          >
            添加流水
          </Button>
        </div>
      </div>
      {renderFilterConditions()}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <span className="text-default-400 text-small">
            共 {totalCount} 条流水
          </span>
          {selectedRowsCount ? (
            <span className="text-small text-default-400">
              {`本页${visibleRowsCount}条流水，选中${selectedRowsCount}条`}
            </span>
          ) : null}
        </div>
        <label className="flex items-center text-default-400 text-small">
          每页:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={onRowsPerPageChange}
          >
            <option value="10">10条</option>
            <option value="15">15条</option>
            <option value="20">20条</option>
            <option value="25">25条</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default React.memo(TopContent);
