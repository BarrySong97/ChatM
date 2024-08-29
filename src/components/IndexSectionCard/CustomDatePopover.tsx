import React from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import dayjs from "dayjs";
import DateFilter from "./DateFilter"; // Assuming you have this component

interface CustomDatePopoverProps {
  value: { start: number; end: number };
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onChange: (v: { start: number; end: number }) => void;
  onTimeReset: () => void;
}

export const CustomDatePopover: React.FC<CustomDatePopoverProps> = ({
  value,
  isOpen,
  setIsOpen,
  onChange,
  onTimeReset,
}) => (
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
          onChange(v);
          onTimeReset();
          setIsOpen(false);
        }}
      />
    </PopoverContent>
  </Popover>
);
