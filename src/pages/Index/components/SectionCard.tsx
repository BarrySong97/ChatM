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

export interface SectionCardProps {
  title: string | React.ReactNode;
  showLeft: boolean;
}
type DataItem = {
  amount: number;
  date: string;
};
const { RangePicker } = DatePicker;
const generateMockData = (period: string, dateRange?: Date[]) => {
  const currentDate = new Date();
  const data = [];

  if (dateRange) {
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const dayDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i <= dayDiff; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      data.push({
        label: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
          date.getDate()
        ).padStart(2, "0")}`,
        data: Math.floor(Math.random() * 1000),
      });
      data.reverse();
    }
  } else if (period === "当前月") {
    const days = currentDate.getDate();
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      data.push({
        label: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
          date.getDate()
        ).padStart(2, "0")}`,
        data: Math.floor(Math.random() * 1000),
      });
    }
  } else if (period === "1月" || period === "3月") {
    const days = period === "1月" ? 30 : 90;
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      data.push({
        label: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
          date.getDate()
        ).padStart(2, "0")}`,
        data: Math.floor(Math.random() * 1000),
      });
    }
  } else {
    const years = period === "1年" ? 1 : period === "3年" ? 3 : 5;
    for (let i = 0; i < years * 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      data.push({
        label: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        data: Math.floor(Math.random() * 10000),
      });
    }
  }

  return data.reverse();
};

const SectionCard: FC<SectionCardProps> = ({ title, showLeft = true }) => {
  const timeFilter = ["当前月", "近1月", "近3月", "近1年", "近3年", "近5年"];
  const [time, setTime] = useState(timeFilter[0]);
  let [value, setValue] = React.useState<RangeValue<DateValue>>();
  const chartData = React.useMemo(() => {
    if (value?.start && value?.end) {
      const start = value.start.toDate(getLocalTimeZone());
      const end = value.end.toDate(getLocalTimeZone());
      return generateMockData("custom", [start, end]);
    }
    return generateMockData(time);
  }, [value, time]);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Card className="block gap-8  mb-8" shadow="sm" radius="sm">
      <CardHeader className="!mb-0 flex justify-between items-start">
        <h3 className="font-semibold pl-2">{title}</h3>
        <div className="flex items-center gap-2">
          {timeFilter.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={time === item ? "flat" : "light"}
              radius="sm"
              color={time === item ? "primary" : "default"}
              onClick={() => {
                setTime(item);
                setValue(undefined);
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
                  ? `${value.start.toString()} - ${value.end.toString()}`
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
      </CardHeader>
      <CardBody className="flex-row gap-8 h-[300px]">
        {showLeft && (
          <div className="space-y-4 w-[280px]">
            <Category />
          </div>
        )}
        <Trend data={chartData} />
      </CardBody>
    </Card>
  );
};

export default SectionCard;
