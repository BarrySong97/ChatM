import React, { useEffect, useState } from "react";
import {
  RangeCalendar,
  Radio,
  RadioGroup,
  Button,
  ButtonGroup,
  cn,
} from "@nextui-org/react";
import type { DateValue } from "@react-types/calendar";
import type { RangeValue } from "@react-types/shared";

import {
  today,
  getLocalTimeZone,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { divide } from "lodash";
export type DateFilterProps = {
  onChange: (value?: RangeValue<DateValue>) => void;
  value?: RangeValue<DateValue>;
};
export default function DateFilter({ onChange }: DateFilterProps) {
  const [value, setValue] = useState<RangeValue<DateValue>>();
  let [focusedValue, setFocusedValue] = React.useState<DateValue>(
    today(getLocalTimeZone())
  );

  let { locale } = useLocale();

  let now = today(getLocalTimeZone());
  let nextMonth = now.add({ months: 1 });

  let nextWeek = {
    start: startOfWeek(now.add({ weeks: 1 }), locale),
    end: endOfWeek(now.add({ weeks: 1 }), locale),
  };
  let thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  let nextMonthValue = {
    start: startOfMonth(nextMonth),
    end: endOfMonth(nextMonth),
  };

  const CustomRadio = (props) => {
    const { children, ...otherProps } = props;

    return (
      <Radio
        {...otherProps}
        classNames={{
          base: cn(
            "flex-none m-0 h-8 bg-content1 hover:bg-content2 items-center justify-between",
            "cursor-pointer rounded-full border-2 border-default-200/60",
            "data-[selected=true]:border-primary"
          ),
          label: "text-tiny text-default-500",
          labelWrapper: "px-1 m-0",
          wrapper: "hidden",
        }}
      >
        {children}
      </Radio>
    );
  };
  //   useEffect(() => {
  //     setValue(value);
  //   }, [_value]);
  console.log(value);

  return (
    <div className="flex flex-col gap-4">
      <RangeCalendar
        bottomContent={
          <div>
            {/* <RadioGroup
              aria-label="Date precision"
              classNames={{
                base: "w-full pb-2",
                wrapper: "-my-2.5 py-2.5 px-3 gap-1 flex-nowrap max-w-[280px] ",
              }}
              defaultValue="exact_dates"
              orientation="horizontal"
            >
              <CustomRadio value="7_days">7天</CustomRadio>
              <CustomRadio value="14_days">14天</CustomRadio>
              <CustomRadio value="14_days">1月</CustomRadio>
            </RadioGroup> */}
            <div className="p-4 flex justify-end">
              <Button
                onClick={() => {
                  onChange(value);
                }}
                color="primary"
                size="sm"
                radius="sm"
                className=""
              >
                确认
              </Button>
            </div>
          </div>
        }
        focusedValue={focusedValue}
        nextButtonProps={{
          variant: "bordered",
        }}
        prevButtonProps={{
          variant: "bordered",
        }}
        topContent={
          <ButtonGroup
            fullWidth
            className="px-3 max-w-full pb-2 pt-3 bg-content1 [&>button]:text-default-500 [&>button]:border-default-200/60"
            radius="full"
            size="sm"
            variant="bordered"
          >
            <Button
              onPress={() => {
                onChange(nextWeek);
                setFocusedValue(nextWeek.end);
              }}
            >
              Next week
            </Button>
            <Button
              onPress={() => {
                onChange(thisMonth);
                setFocusedValue(thisMonth.start);
              }}
            >
              This month
            </Button>
            <Button
              onPress={() => {
                onChange(nextMonthValue), setFocusedValue(nextMonthValue.start);
              }}
            >
              Next month
            </Button>
          </ButtonGroup>
        }
        value={value}
        onChange={(v) => {
          setValue(v);
        }}
        onFocusChange={setFocusedValue}
      />
    </div>
  );
}
