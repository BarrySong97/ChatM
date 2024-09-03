import React from "react";
import { Button } from "@nextui-org/react";

interface TimeFilterButtonsProps {
  timeFilter: string[];
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

export const TimeFilterButtons: React.FC<TimeFilterButtonsProps> = ({
  timeFilter,
  selectedTime,
  onTimeChange,
}) => (
  <>
    {timeFilter.map((item) => (
      <Button
        key={item}
        size="sm"
        variant={selectedTime === item ? "flat" : "light"}
        radius="sm"
        // color={selectedTime === item ? "primary" : "default"}
        onClick={() => onTimeChange(item)}
      >
        {item}
      </Button>
    ))}
  </>
);
