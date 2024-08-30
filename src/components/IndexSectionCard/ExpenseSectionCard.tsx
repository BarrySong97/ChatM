import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { TimeFilterButtons } from "./TimeFilterButtons";
import { CustomDatePopover } from "./CustomDatePopover";
import { CategoryChart } from "./CategoryChart";
import { TrendChart } from "./TrendChart";
import {
  useExpenseCategoryService,
  useExpenseLineChartService,
} from "@/api/hooks/expense";
import { colors } from "./constant";
import dayjs from "dayjs";

const timeFilter = ["当前月", "近1月", "近3月", "近1年", "近3年", "近5年"];

export const ExpenseSectionCard: React.FC = () => {
  const [time, setTime] = useState(timeFilter[0]);
  const [value, setValue] = useState({ start: 0, end: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("rank");
  const [chartType, setChartType] = useState("line");

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
        <TimeFilterButtons
          timeFilter={timeFilter}
          selectedTime={time}
          onTimeChange={setTime}
        />
        <CustomDatePopover
          value={value}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onChange={setValue}
          onTimeReset={() => setTime("")}
        />
      </div>
      <div className="flex gap-8">
        <Card className="gap-8 flex-[2] mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-end items-center">
            <CategoryChart
              categoryType={categoryType}
              setCategoryType={setCategoryType}
              categoryData={categoryData}
              colors={colors}
            />
          </CardHeader>
        </Card>
        <Card className="block gap-8 flex-[3] mb-8" shadow="sm" radius="sm">
          <CardHeader className="!mb-0 flex justify-end items-start">
            <TrendChart
              chartType={chartType}
              setChartType={setChartType}
              lineData={lineData}
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
