import { getBrowserTimezone } from "@/lib/utils";
import { parseDate } from "@internationalized/date";
import { Button, DatePicker } from "@nextui-org/react";
import dayjs from "dayjs";
import React, { FC, useEffect, useState } from "react";
export interface CommonDateRangeFilterProps {
  onChange: (value: { start: Date; end: Date }) => void;
  onReset?: () => void;
  value: { start: Date | null; end: Date | null };
  type?: "single" | "range";
}
const timezone = getBrowserTimezone();
const CommonDateRangeFilter: FC<CommonDateRangeFilterProps> = ({
  onChange,
  value,
  onReset,
  type = "range",
}) => {
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  useEffect(() => {
    if (type === "range") {
      setStart(value.start);
    }
    setEnd(value.end);
  }, [value]);

  return (
    <div className="p-3 space-y-3 w-[280px]">
      <div className="text-sm font-medium">日期范围</div>
      {type === "single" ? null : (
        <DatePicker
          label="开始日期"
          size="sm"
          value={start ? parseDate(dayjs(start).format("YYYY-MM-DD")) : null}
          onChange={(value) => {
            setStart(value.toDate(timezone));
          }}
          radius="sm"
          className="max-w-[284px]"
        />
      )}
      <DatePicker
        label="结束日期"
        size="sm"
        value={end ? parseDate(dayjs(end).format("YYYY-MM-DD")) : null}
        onChange={(value) => {
          setEnd(value.toDate(timezone));
        }}
        radius="sm"
        className="max-w-[284px]"
      />

      <div className="flex justify-end gap-2">
        {onReset && (
          <Button
            onClick={onReset}
            color="default"
            variant="flat"
            size="sm"
            radius="sm"
          >
            重置
          </Button>
        )}
        <Button
          isDisabled={!start || !end}
          onClick={() => {
            if (start && end) {
              onChange({
                start,
                end,
              });
            }
          }}
          color="primary"
          size="sm"
          radius="sm"
        >
          确定
        </Button>
      </div>
    </div>
  );
};

export default CommonDateRangeFilter;
