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
import {
  useAssetCategoryService,
  useAssetTrendService,
} from "@/api/hooks/assets";
import DateFilter from "@/pages/Index/components/date-filter";
import {
  MaterialSymbolsBarChart,
  MaterialSymbolsShowChart,
} from "@/pages/Index/icon";
import { Trend } from "@/pages/Index/components/trend";
import { BarChartComponent } from "@/pages/Index/components/bar-chart";
import { useParams } from "react-router-dom";

export interface SectionCardProps {
  setValue: (date: { start: number; end: number }) => void;
  value: { start: number; end: number };
}

const AssetsSubDetailSectionCard: FC<SectionCardProps> = ({
  setValue,
  value,
}) => {
  const { id } = useParams<{ id: string; type: string }>();
  const timeFilter = ["近1年", "近3年", "近5年", "近10年"];
  const [time, setTime] = useState(timeFilter[0]);
  useEffect(() => {
    const now = dayjs();
    switch (time) {
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
      case "近10年":
        setValue({
          start: now.subtract(10, "years").valueOf(),
          end: now.valueOf(),
        });
        break;
      default:
        setValue({
          start: now.subtract(1, "year").valueOf(),
          end: now.valueOf(),
        });
    }
  }, [time]);
  const [isOpen, setIsOpen] = React.useState(false);
  const { lineData } = useAssetTrendService({
    startDate: value.start,
    endDate: value.end,
    accountId: id!,
  });

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
        <Card className="block gap-8 flex-[3]  mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-between items-start">
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
    </div>
  );
};

export default AssetsSubDetailSectionCard;
