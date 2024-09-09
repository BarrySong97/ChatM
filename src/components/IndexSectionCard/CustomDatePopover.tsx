import React from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import dayjs from "dayjs";
import CommonDateRangeFilter from "../CommonDateRangeFilter";
import { MaterialSymbolsCalendarMonth } from "./icon";

interface CustomDatePopoverProps {
  value: { start: number; end: number };
  isOpen: boolean;
  type?: "single" | "range";
  setIsOpen: (open: boolean) => void;
  onChange: (v: { start: number; end: number }) => void;
  time?: string;
  onTimeReset: () => void;
}

export const CustomDatePopover: React.FC<CustomDatePopoverProps> = ({
  value,
  isOpen,
  setIsOpen,
  onChange,
  time,
  type = "range",
  onTimeReset,
}) => {
  const renderDateText = () => {
    if (type === "single") {
      return `截止 ${dayjs(value.end).format("YYYY-MM-DD")}`;
    }
    return `${dayjs(value.start).format("YYYY-MM-DD")} - ${dayjs(
      value.end
    ).format("YYYY-MM-DD")}`;
  };
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      showArrow
      radius="sm"
      placement="bottom"
    >
      <PopoverTrigger>
        <Button
          size="sm"
          startContent={<MaterialSymbolsCalendarMonth className="text-base" />}
          variant={time ? "light" : "flat"}
          radius="sm"
        >
          {renderDateText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <CommonDateRangeFilter
          type={type}
          value={{
            start: dayjs(value.start).toDate(),
            end: dayjs(value.end).toDate(),
          }}
          onChange={(v) => {
            onChange({
              start: v.start.getTime(),
              end: v.end.getTime(),
            });
            onTimeReset();
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
