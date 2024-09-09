import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "@nextui-org/react";
import { TimeFilterButtons } from "./TimeFilterButtons";
import { CategoryChart } from "./CategoryChart";
import { ChartTabPlaceHolder, TrendChart } from "./TrendChart";
import {
  useAssetCategoryService,
  useAssetSankeyService,
  useAssetTrendService,
} from "@/api/hooks/assets";
import dayjs from "dayjs";
import { colors } from "./constant";
import { CustomDatePopover } from "./CustomDatePopover";

const timeFilter = ["近3月", "近1年", "近3年", "近5年", "近十年"];

const now = dayjs();
export const AssetsSectionCard: React.FC<{
  showLeft?: boolean;
  title?: React.ReactNode;
  showDefaultTitle?: boolean;
  accountId?: string;
  chartTabPlaceHolder?: ChartTabPlaceHolder[];
  showSankey?: boolean;
}> = ({
  showLeft = true,
  title,
  showDefaultTitle = true,
  chartTabPlaceHolder,
  showSankey = false,
  accountId,
}) => {
  const [time, setTime] = useState("");
  const [value, setValue] = useState({
    start: now.subtract(3, "months").valueOf(),
    end: now.valueOf(),
  });
  // const [isOpen, setIsOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("rank");
  const [chartType, setChartType] = useState(showSankey ? "sankey" : "line");

  useEffect(() => {
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

  const [isOpen, setIsOpen] = useState(false);
  const { sankeyData } = useAssetSankeyService(
    accountId!,
    "asset",
    value.start,
    value.end
  );
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TimeFilterButtons
          timeFilter={timeFilter}
          selectedTime={time || timeFilter[0]}
          onTimeChange={setTime}
        />
        <CustomDatePopover
          time={time}
          type="single"
          value={value}
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
              sankeyData={sankeyData}
              showSankey={showSankey}
              lineData={lineData}
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
