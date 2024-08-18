import React, { FC, useEffect, useState } from "react";
import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";

import {
  today,
  getLocalTimeZone,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from "@internationalized/date";

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  RangeValue,
  DateValue,
} from "@nextui-org/react";
import { Category } from "./category";
import { Trend } from "./trend";
import DateFilter from "./date-filter";
import CategoryList from "@/components/CategoryList";
import {
  CategoryData,
  TrendData,
  useExpenseCategoryService,
  useExpenseLineChartService,
} from "@/api/hooks/expense";
import dayjs from "dayjs";

export interface SectionCardProps {
  title: string | React.ReactNode;
}
type DataItem = {
  amount: number;
  date: string;
};

const SectionCard: FC<SectionCardProps> = ({ title }) => {
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
  const { lineData } = useExpenseLineChartService({
    startDate: value.start,
    endDate: value.end,
  });
  const { categoryData } = useExpenseCategoryService({
    startDate: value.start,
    endDate: value.end,
  });

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
          <CardHeader className="!mb-0 flex justify-between items-start">
            <h3 className="font-semibold pl-2">{title}分类排行</h3>
          </CardHeader>
          <CardBody>
            <CategoryList items={categoryData ?? []} />
          </CardBody>
        </Card>
        <Card className="block gap-8 flex-[3]  mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-between items-start">
            <h3 className="font-semibold pl-2">{title}趋势</h3>
          </CardHeader>
          <CardBody className="flex-row gap-8 h-[300px]">
            <Trend data={lineData ?? []} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SectionCard;
