import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { TimeFilterButtons } from "./TimeFilterButtons";
import { CustomDatePopover } from "./CustomDatePopover";
import { CategoryChart } from "./CategoryChart";
import { ChartTabPlaceHolder, TrendChart } from "./TrendChart";
import {
  useExpenseCategoryService,
  useExpenseLineChartService,
} from "@/api/hooks/expense";
import { colors } from "./constant";
import dayjs from "dayjs";
import { useAssetSankeyService } from "@/api/hooks/assets";
import { useLocalStorageState } from "ahooks";

const timeFilter = ["当前月", "近1月", "近3月", "近1年", "近3年", "近5年"];

const now = dayjs();
export const ExpenseSectionCard: React.FC<{
  showLeft?: boolean;
  title?: React.ReactNode;
  showDefaultTitle?: boolean;
  accountId?: string;
  chartTabPlaceHolder?: ChartTabPlaceHolder[];
  showSankey?: boolean;
  onValueChange?: (value: { start: number; end: number }) => void;
}> = ({
  showLeft = true,
  title,
  showDefaultTitle = false,
  chartTabPlaceHolder,
  accountId,
  showSankey = false,
  onValueChange,
}) => {
  const [time, setTime] = useState(timeFilter[0]);
  const [value, setValue] = useState({
    start: now.startOf("month").valueOf(),
    end: now.endOf("month").valueOf(),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [categoryType, setCategoryType] = useLocalStorageState(
    "expenseCategoryType",
    {
      defaultValue: "rank",
    }
  );
  const [chartType, setChartType] = useLocalStorageState("expenseChartType", {
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

  const { lineData } = useExpenseLineChartService({
    startDate: value.start,
    endDate: value.end,
    accountId,
  });

  const { categoryData } = useExpenseCategoryService({
    startDate: value.start,
    endDate: value.end,
  });
  const { sankeyData } = useAssetSankeyService(
    accountId!,
    "expense",
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
          <Card className="gap-8 flex-[2] mb-8" shadow="sm" radius="sm">
            <CardHeader className="!mb-0 flex justify-end items-center">
              <CategoryChart
                categoryType={categoryType ?? "rank"}
                type="expense"
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
              type="expense"
              chartTabPlaceHolder={chartTabPlaceHolder}
              showSankey={showSankey}
              setChartType={setChartType}
              accountId={accountId}
              lineData={lineData}
              sankeyData={sankeyData}
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
