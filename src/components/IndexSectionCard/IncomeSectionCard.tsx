import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { TimeFilterButtons } from "./TimeFilterButtons";
import { CustomDatePopover } from "./CustomDatePopover";
import { CategoryChart } from "./CategoryChart";
import { ChartTabPlaceHolder, TrendChart } from "./TrendChart";
import {
  useIncomeCategoryService,
  useIncomeLineChartService,
} from "@/api/hooks/income";
import dayjs from "dayjs";
import { colors } from "./constant";
import { useAssetSankeyService } from "@/api/hooks/assets";
import { useLocalStorageState } from "ahooks";

const timeFilter = ["当前月", "近1月", "近3月", "近1年", "近3年", "近5年"];
const now = dayjs();
export const IncomeSectionCard: React.FC<{
  showLeft?: boolean;
  title?: React.ReactNode;
  showDefaultTitle?: boolean;
  onValueChange?: (value: { start: number; end: number }) => void;
  chartTabPlaceHolder?: ChartTabPlaceHolder[];
  accountId?: string;
  showSankey?: boolean;
}> = ({
  showLeft = true,
  title,
  showDefaultTitle = false,
  chartTabPlaceHolder,
  onValueChange,
  accountId,
  showSankey = false,
}) => {
  const [time, setTime] = useState(timeFilter[0]);
  const [value, setValue] = useState({
    start: now.startOf("month").valueOf(),
    end: now.endOf("month").valueOf(),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [categoryType, setCategoryType] = useLocalStorageState(
    "incomeCategoryType",
    {
      defaultValue: "rank",
    }
  );
  const [chartType, setChartType] = useLocalStorageState("incomeChartType", {
    defaultValue: showSankey ? "sankey" : "line",
  });

  useEffect(() => {
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
    }
  }, [time]);

  useEffect(() => {
    onValueChange?.(value);
  }, [value]);
  const { lineData } = useIncomeLineChartService({
    startDate: value.start,
    endDate: value.end,
    accountId,
  });

  const { categoryData } = useIncomeCategoryService({
    startDate: value.start,
    endDate: value.end,
  });

  const { sankeyData } = useAssetSankeyService(
    accountId!,
    "income",
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
          isOpen={isOpen}
          time={time}
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
                categoryType={categoryType ?? "rank"}
                type="income"
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
              showDefaultTitle={showDefaultTitle}
              chartType={chartType ?? (showSankey ? "sankey" : "line")}
              setChartType={setChartType}
              accountId={accountId}
              chartTabPlaceHolder={chartTabPlaceHolder}
              type="income"
              lineData={lineData}
              showSankey={showSankey}
              sankeyData={sankeyData}
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
