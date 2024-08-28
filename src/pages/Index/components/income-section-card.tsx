import React, { FC, useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { Category } from "./category";
import { Trend } from "./trend";
import DateFilter from "./date-filter";
import CategoryList from "@/components/CategoryList";
import {
  useExpenseCategoryService,
  useExpenseLineChartService,
} from "@/api/hooks/expense";
import dayjs from "dayjs";
import {
  MaterialSymbolsBarChart,
  MaterialSymbolsLightPieChart,
  MaterialSymbolsShowChart,
} from "../icon";
import { BarChartComponent } from "./bar-chart";
import {
  useIncomeCategoryService,
  useIncomeLineChartService,
} from "@/api/hooks/income";
export interface SectionCardProps {
  title: string | React.ReactNode;
}
const colors = [
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#6b7280", // gray
  "#71717a", // zinc
  "#737373", // neutral
  "#78716c", // stone
  "#ef4444", // red
];

const ExpenseSectionCard: FC<SectionCardProps> = ({ title }) => {
  const date = new Date();
  const timeFilter = ["当前月", "近1月", "近3月", "近1年", "近3年", "近5年"];
  const [time, setTime] = useState(timeFilter[0]);
  useEffect(() => {
    const now = dayjs();
    switch (time) {
      case "当前月":
        setValue({
          start: now.startOf("month").valueOf(),
          end: now.endOf("month").valueOf(),
        });
        break;
      case "近1月":
        setValue({
          start: now.subtract(1, "month").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近3月":
        setValue({
          start: now.subtract(3, "months").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近1年":
        setValue({
          start: now.subtract(1, "year").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近3年":
        setValue({
          start: now.subtract(3, "years").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近5年":
        setValue({
          start: now.subtract(5, "years").valueOf(),
          end: now.valueOf(),
        });
        break;
      default:
        setValue({
          start: now.startOf("month").valueOf(),
          end: now.endOf("month").valueOf(),
        });
    }
  }, [time]);
  let [value, setValue] = React.useState<{
    start: number;
    end: number;
  }>({
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime(),
    end: new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      0,
      0,
      0
    ).getTime(),
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const { lineData } = useIncomeLineChartService({
    startDate: value.start,
    endDate: value.end,
  });
  const { categoryData } = useIncomeCategoryService({
    startDate: value.start,
    endDate: value.end,
  });
  const [categoryType, setCategoryType] = useState("rank");
  const [chartType, setChartType] = useState("line");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {timeFilter.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={time === item ? "flat" : "light"}
            radius="sm"
            color={time === item ? "primary" : "default"}
            onClick={() => {
              setTime(item);
            }}
          >
            {item}
          </Button>
        ))}
        <Popover
          isOpen={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          showArrow
          radius="sm"
          placement="left-start"
        >
          <PopoverTrigger>
            <Button
              size="sm"
              variant={!value ? "light" : "flat"}
              radius="sm"
              color={!value ? "default" : "primary"}
            >
              {value
                ? `${dayjs(value.start).format("YYYY-MM-DD")} - ${dayjs(
                    value.end
                  ).format("YYYY-MM-DD")}`
                : "自定义"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <DateFilter
              onChange={(v) => {
                setValue(v);
                setTime("");
                setIsOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex  gap-8">
        <Card className="block gap-8 flex-[2]  mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-end items-center">
            <div>
              <Tabs
                onSelectionChange={(key) => setCategoryType(key as string)}
                selectedKey={categoryType}
                aria-label="Options"
                size="sm"
                radius="sm"
              >
                <Tab
                  key="rank"
                  title={
                    <div className="flex items-center gap-1">
                      <MaterialSymbolsBarChart className="text-base rotate-90" />
                      <div>排行</div>
                    </div>
                  }
                ></Tab>
                <Tab
                  key="proportion"
                  title={
                    <div className="flex items-center gap-1">
                      <MaterialSymbolsLightPieChart className="text-base" />
                      <div>占比</div>
                    </div>
                  }
                ></Tab>
              </Tabs>
            </div>
          </CardHeader>
          <CardBody className=" ">
            {categoryType !== "rank" ? (
              <div className="h-[280px]">
                <Category
                  data={
                    categoryData?.map((v, index) => ({
                      content: v.content,
                      color: colors[index],
                      fill: colors[index],
                      amount: Number(v.amount) as unknown as string,
                    })) ?? []
                  }
                />
              </div>
            ) : (
              <CategoryList items={categoryData ?? []} />
            )}
          </CardBody>
        </Card>
        <Card className="block gap-8 flex-[3]  mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-end items-start">
            <div>
              <Tabs
                onSelectionChange={(key) => setChartType(key as string)}
                selectedKey={chartType}
                aria-label="Options"
                size="sm"
                radius="sm"
              >
                <Tab
                  key="line"
                  title={
                    <div className="flex items-center gap-1">
                      <MaterialSymbolsShowChart className="text-base" />
                      <div>折线图</div>
                    </div>
                  }
                ></Tab>
                <Tab
                  key="bar"
                  title={
                    <div className="flex items-center gap-1">
                      <MaterialSymbolsBarChart className="text-base rotate-90" />
                      <div>柱状图</div>
                    </div>
                  }
                ></Tab>
              </Tabs>
            </div>
          </CardHeader>
          <CardBody className="flex-1  justify-center items-center">
            <div className="h-[300px] w-full">
              {chartType === "line" ? (
                <Trend data={lineData ?? []} />
              ) : (
                <BarChartComponent chartData={lineData ?? []} />
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseSectionCard;
