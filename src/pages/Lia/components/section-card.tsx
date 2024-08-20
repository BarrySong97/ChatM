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
import { useLiabilityTrendService } from "@/api/hooks/liability";

export interface SectionCardProps {
  title: string | React.ReactNode;
}

const LiaDetailSectionCard: FC<SectionCardProps> = ({ title }) => {
  const timeFilter = ["近1年", "近3年", "近5年", "近10年"];
  const [time, setTime] = useState(timeFilter[0]);
  const [value, setValue] = React.useState<{ start: number; end: number }>({
    start: dayjs().subtract(1, "year").valueOf(),
    end: dayjs().valueOf(),
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    const now = dayjs();
    const timeRanges = {
      近1年: 1,
      近3年: 3,
      近5年: 5,
      近10年: 10,
    };
    const years = timeRanges[time as keyof typeof timeRanges] || 1;
    setValue({
      start: now.subtract(years, "year").valueOf(),
      end: now.valueOf(),
    });
  }, [time]);

  const { lineData } = useLiabilityTrendService({
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
                setValue(v);
                setTime("");
                setIsOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Card className="block gap-8 flex-[3] mb-8" shadow="sm" radius="sm">
        <CardHeader className="!mb-0 flex justify-between items-start">
          <div>{title}</div>
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

export default LiaDetailSectionCard;
