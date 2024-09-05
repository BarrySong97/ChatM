import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "@nextui-org/react";
import { TimeFilterButtons } from "./TimeFilterButtons";
import { CustomDatePopover } from "./CustomDatePopover";
import { CategoryChart } from "./CategoryChart";
import { ChartTabPlaceHolder, TrendChart } from "./TrendChart";
import {
  useLiabilityCategoryService,
  useLiabilityTrendService,
} from "@/api/hooks/liability";
import { colors } from "./constant";
import dayjs from "dayjs";
import { useAssetSankeyService } from "@/api/hooks/assets";

const timeFilter = ["近3月", "近1年", "近3年", "近5年", "近十年"];

export const LiabilitySectionCard: React.FC<{
  showLeft?: boolean;
  title?: React.ReactNode;
  accountId?: string;
  showDefaultTitle?: boolean;
  chartTabPlaceHolder?: ChartTabPlaceHolder[];
  showSankey?: boolean;
}> = ({
  showLeft = true,
  title,
  showDefaultTitle = true,
  chartTabPlaceHolder,
  accountId,
  showSankey = false,
}) => {
  const [time, setTime] = useState(timeFilter[0]);
  const [value, setValue] = useState({ start: 0, end: 0 });
  const [categoryType, setCategoryType] = useState("rank");
  const [chartType, setChartType] = useState(showSankey ? "sankey" : "line");

  useEffect(() => {
    const now = dayjs();
    switch (time) {
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
      case "近十年":
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

  const { lineData } = useLiabilityTrendService({
    startDate: value.start,
    endDate: value.end,
    accountId,
  });

  const { categoryData } = useLiabilityCategoryService({
    startDate: value.start,
    endDate: value.end,
  });
  const [isOpen, setIsOpen] = useState(false);
  const { sankeyData } = useAssetSankeyService(
    accountId!,
    "liability",
    value.start,
    value.end
  );
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TimeFilterButtons
          timeFilter={timeFilter}
          selectedTime={time}
          onTimeChange={setTime}
        />
        <CustomDatePopover
          value={value}
          time={time}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onChange={setValue}
          onTimeReset={() => setTime("")}
        />
      </div>
      <div className="flex gap-8">
        {showLeft ? (
          <Card className="block gap-8 flex-[2] mb-8" shadow="sm" radius="sm">
            <CardHeader className="!mb-0 flex justify-end items-center">
              <CategoryChart
                categoryType={categoryType}
                type="liability"
                setCategoryType={setCategoryType}
                categoryData={categoryData}
                colors={colors}
              />
            </CardHeader>
          </Card>
        ) : null}
        <Card className="block gap-8 flex-[3] mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-end items-start">
            <TrendChart
              title={title}
              chartType={chartType}
              setChartType={setChartType}
              accountId={accountId}
              lineData={lineData}
              showDefaultTitle={showDefaultTitle}
              chartTabPlaceHolder={chartTabPlaceHolder}
              showSankey={showSankey}
              sankeyData={sankeyData}
              type="liability"
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
