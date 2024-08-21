import {
  Button,
  Listbox,
  ListboxItem,
  Tooltip,
  Input,
  DatePicker,
} from "@nextui-org/react";

import { FC, useState } from "react";
import { operationTranslations } from "./table";
import { FinancialOperation } from "@/api/db/manager";
import { MenuProps, Popover } from "antd";
import { MaterialSymbolsArrowForwardIosRounded } from "@/assets/icon";
import { Asset, Expense, Income, Liability } from "@db/schema";
import { parseDate } from "@internationalized/date";
import dayjs from "dayjs";

export interface TransactionsFilterProps {
  selectedTypes: Set<string>;
  setSelectedTypes: (types: Set<string>) => void;
  selectedSource: Set<string>;
  setSelectedSource: (source: Set<string>) => void;
  minAmount: number;
  setMinAmount: (amount: number) => void;
  maxAmount: number;
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
const TransactionsFilter: FC<TransactionsFilterProps> = (props) => {
  const {
    selectedTypes,
    setSelectedTypes,
    selectedSource,
    setSelectedSource,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    incomes,
    expenses,
    assets,
    liabilities,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = props;
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          1st menu item
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.aliyun.com"
        >
          2nd menu item (disabled)
        </a>
      ),
      disabled: true,
    },
    {
      key: "3",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.luohanacademy.com"
        >
          3rd menu item (disabled)
        </a>
      ),
      disabled: true,
    },
    {
      key: "4",
      danger: true,
      label: "a danger item",
    },
  ];
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
            console.log(333);

            setSelectedTypes(keys as Set<string>);
          }}
        >
          <ListboxItem key={FinancialOperation.Income}>
            {operationTranslations[FinancialOperation.Income]}
          </ListboxItem>
          <ListboxItem key={FinancialOperation.Expenditure}>
            {operationTranslations[FinancialOperation.Expenditure]}
          </ListboxItem>
          <ListboxItem key={FinancialOperation.Transfer}>
            {operationTranslations[FinancialOperation.Transfer]}
          </ListboxItem>
          <ListboxItem key={FinancialOperation.RepayLoan}>
            {operationTranslations[FinancialOperation.RepayLoan]}
          </ListboxItem>
          <ListboxItem key={FinancialOperation.Borrow}>
            {operationTranslations[FinancialOperation.Borrow]}
          </ListboxItem>
          <ListboxItem key={FinancialOperation.LoanExpenditure}>
            {operationTranslations[FinancialOperation.LoanExpenditure]}
          </ListboxItem>
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
            <ListboxItem key="assets">
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
                    {assets?.map((asset) => (
                      <ListboxItem key={asset.id}>{asset.name}</ListboxItem>
                    )) ?? []}
                  </Listbox>
                }
              >
                <div className="flex items-center justify-between">
                  <div>资产</div>
                  <MaterialSymbolsArrowForwardIosRounded />
                </div>
              </Popover>
            </ListboxItem>
            <ListboxItem key="liability">
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
                    selectionMode="multiple"
                    selectedKeys={selectedSource}
                    onSelectionChange={(keys) => {
                      setSelectedSource(keys as Set<string>);
                    }}
                  >
                    {liabilities?.map((liability) => (
                      <ListboxItem key={liability.id}>
                        {liability.name}
                      </ListboxItem>
                    )) ?? []}
                  </Listbox>
                }
              >
                <div className="flex items-center justify-between">
                  <div>负债</div>
                  <MaterialSymbolsArrowForwardIosRounded />
                </div>
              </Popover>
            </ListboxItem>
            <ListboxItem key="income">
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
                    {incomes?.map((income) => (
                      <ListboxItem key={income.id}>{income.name}</ListboxItem>
                    )) ?? []}
                  </Listbox>
                }
              >
                <div className="flex items-center justify-between">
                  <div>{operationTranslations[FinancialOperation.Income]}</div>
                  <MaterialSymbolsArrowForwardIosRounded />
                </div>
              </Popover>
            </ListboxItem>
            <ListboxItem key="expenditure">
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
                    {expenses?.map((expense) => (
                      <ListboxItem key={expense.id}>{expense.name}</ListboxItem>
                    )) ?? []}
                  </Listbox>
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    {operationTranslations[FinancialOperation.Expenditure]}
                  </div>
                  <MaterialSymbolsArrowForwardIosRounded />
                </div>
              </Popover>
            </ListboxItem>
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
              value={minAmount.toString()}
              onValueChange={(e) => setMinAmount(e)}
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
              value={maxAmount.toString()}
              onValueChange={(e) => setMaxAmount(e)}
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
    {
      label: "日期",
      content: (
        <div className="w-[240px] p-2 space-y-3">
          <DatePicker
            radius="sm"
            size="sm"
            value={
              startDate
                ? parseDate(startDate.toISOString().split("T")[0])
                : undefined
            }
            onChange={(e) => {
              setStartDate(new Date(e.toString()));
            }}
            showMonthAndYearPickers
            label="开始日期"
          />
          <DatePicker
            radius="sm"
            size="sm"
            showMonthAndYearPickers
            value={
              endDate
                ? parseDate(endDate.toISOString().split("T")[0])
                : undefined
            }
            onChange={(e) => {
              setEndDate(new Date(e.toString()));
            }}
            label="结束日期"
          />
        </div>
      ),
    },
  ];
  const [isOpen, setIsOpen] = useState(true);
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
      {/* <Dropdown
        classNames={{
          content: "max-w-[120px] min-w-[120px]",
        }}
        isDismissable={false}
        showArrow
        closeOnSelect={false}
        shouldCloseOnBlur={false}
      >
        <DropdownTrigger>
          <Button radius="sm" size="sm" variant="flat">
            筛选
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Dynamic Actions" items={filterItems}>
          {(item) => (
            <DropdownItem key={item.label}>
              <Tooltip
                shouldCloseOnBlur={false}
                placement="right"
                offset={22}
                delay={200}
                closeDelay={1000}
                content={item.content}
              >
                {item.label}
              </Tooltip>
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown> */}
    </div>
  );
};

export default TransactionsFilter;
