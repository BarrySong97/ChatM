import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "@nextui-org/react";
import { TimeFilterButtons } from "./TimeFilterButtons";
import { CategoryChart } from "./CategoryChart";
import { ChartTabPlaceHolder, TrendChart } from "./TrendChart";
import {
  useAssetCategoryService,
  useAssetTrendService,
} from "@/api/hooks/assets";
import dayjs from "dayjs";
import { colors } from "./constant";

const timeFilter = ["近3月", "近1年", "近3年", "近5年", "近十年"];

export const AssetsSectionCard: React.FC<{
  showLeft?: boolean;
  title?: React.ReactNode;
  showDefaultTitle?: boolean;
  accountId?: string;
  chartTabPlaceHolder?: ChartTabPlaceHolder[];
}> = ({
  showLeft = true,
  title,
  showDefaultTitle = true,
  chartTabPlaceHolder,
  accountId,
}) => {
  const [time, setTime] = useState(timeFilter[0]);
  const [value, setValue] = useState({ start: 0, end: 0 });
  // const [isOpen, setIsOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("rank");
  const [chartType, setChartType] = useState("line");

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

  const { lineData } = useAssetTrendService({
    startDate: value.start,
    endDate: value.end,
    accountId,
  });

  const { categoryData } = useAssetCategoryService({
    startDate: value.start,
    endDate: value.end,
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TimeFilterButtons
          timeFilter={timeFilter}
          selectedTime={time}
          onTimeChange={setTime}
        />
        {/* <CustomDatePopover
          time={time}
          value={value}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onChange={setValue}
          onTimeReset={() => setTime("")}
        /> */}
      </div>
      <div className="flex gap-8">
        {showLeft ? (
          <Card className="block gap-8 flex-[2] mb-8" shadow="sm" radius="sm">
            <CardHeader className="!mb-0 flex justify-end items-center">
              <CategoryChart
                categoryType={categoryType}
                setCategoryType={setCategoryType}
                type="asset"
                categoryData={categoryData}
                colors={colors}
              />
            </CardHeader>
          </Card>
        ) : null}
        <Card className="block gap-8 flex-[3] mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-end items-start">
            <TrendChart
              accountId={accountId}
              chartType={chartType}
              type="asset"
              showDefaultTitle={showDefaultTitle}
              setChartType={setChartType}
              chartTabPlaceHolder={chartTabPlaceHolder}
              title={title}
              lineData={lineData}
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
