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
import dayjs from "dayjs";
import DateFilter from "@/pages/Index/components/date-filter";
import {
  MaterialSymbolsBarChart,
  MaterialSymbolsShowChart,
} from "@/pages/Index/icon";
import { Trend } from "@/pages/Index/components/trend";
import { BarChartComponent } from "@/pages/Index/components/bar-chart";
import { useExpenseLineChartService } from "@/api/hooks/expense";
import Decimal from "decimal.js";

export type SectionCardValue = {
  start: number;
  end: number;
};
export interface SectionCardProps {
  onTimeChange: (value: SectionCardValue) => void;
  value: SectionCardValue;
}

const date = new Date();
const ExpenseDetailSectionCard: FC<SectionCardProps> = ({
  onTimeChange,
  value,
}) => {
  const timeFilter = ["当前月", "近1月", "近3月", "近1年", "近3年", "近5年"];
  const [time, setTime] = useState(timeFilter[0]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [chartType, setChartType] = useState("line");
  useEffect(() => {
    onTimeChange(value);
  }, [value]);

  useEffect(() => {
    const now = dayjs();
    switch (time) {
      case "当前月":
        onTimeChange({
          start: now.startOf("month").valueOf(),
          end: now.endOf("month").valueOf(),
        });
        break;
      case "近1月":
        onTimeChange({
          start: now.subtract(1, "month").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近3月":
        onTimeChange({
          start: now.subtract(3, "months").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近1年":
        onTimeChange({
          start: now.subtract(1, "year").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近3年":
        onTimeChange({
          start: now.subtract(3, "years").valueOf(),
          end: now.valueOf(),
        });
        break;
      case "近5年":
        onTimeChange({
          start: now.subtract(5, "years").valueOf(),
          end: now.valueOf(),
        });
        break;
      default:
        onTimeChange({
          start: now.startOf("month").valueOf(),
          end: now.endOf("month").valueOf(),
        });
    }
  }, [time]);

  const { lineData } = useExpenseLineChartService({
    startDate: value.start,
    endDate: value.end,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <div className="flex items-center gap-2 mb-4">
          {timeFilter.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={time === item ? "flat" : "light"}
              radius="sm"
              color={time === item ? "primary" : "default"}
              onClick={() => setTime(item)}
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
                  onTimeChange(v);
                  setTime("");
                  setIsOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Card className="block gap-8 flex-[3] mb-8" shadow="sm" radius="sm">
        <CardHeader className="!mb-0 flex justify-between items-start">
          <div>
            <div className="text-sm font-medium text-gray-500">
              该时间段支出
            </div>
            <div className="text-gray-900 text-3xl font-medium">
              {lineData
                ?.reduce(
                  (prev, curr) => new Decimal(prev).add(curr.amount),
                  new Decimal(0)
                )
                .toFixed(2) ?? "0.00"}
            </div>
          </div>
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
              />
              <Tab
                key="bar"
                title={
                  <div className="flex items-center gap-1">
                    <MaterialSymbolsBarChart className="text-base rotate-90" />
                    <div>柱状图</div>
                  </div>
                }
              />
            </Tabs>
          </div>
        </CardHeader>
        <CardBody className="flex-1 justify-center items-center">
          <div className="h-[200px] w-full">
            {chartType === "line" ? (
              <Trend data={lineData ?? []} />
            ) : (
              <BarChartComponent chartData={lineData ?? []} />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ExpenseDetailSectionCard;
