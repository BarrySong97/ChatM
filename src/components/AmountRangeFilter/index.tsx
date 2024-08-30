import { Button, Input } from "@nextui-org/react";
import React, { FC, useEffect, useState } from "react";
export interface AmountRangeFilterProps {
  minAmount?: number;
  maxAmount?: number;
  setMinAmount: (value?: number) => void;
  setMaxAmount: (value?: number) => void;
  onReset: () => void;
}
const AmountRangeFilter: FC<AmountRangeFilterProps> = ({
  minAmount,
  maxAmount,
  setMinAmount,
  setMaxAmount,
  onReset,
}) => {
  const [min, setMin] = useState<number | undefined>(undefined);
  const [max, setMax] = useState<number | undefined>(undefined);
  useEffect(() => {
    setMin(minAmount);
    setMax(maxAmount);
  }, [minAmount, maxAmount]);
  return (
    <div className="space-y-3 w-[280px] p-3">
      <div className="text-sm font-medium">金额范围</div>
      <div className="flex flex-col gap-3">
        <Input
          type="number"
          placeholder="输入最小金额"
          size="sm"
          label="最小金额"
          value={min?.toString() ?? ""}
          onValueChange={(e) => setMin(Number(e))}
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">¥</span>
            </div>
          }
        />
        <Input
          type="number"
          placeholder="输入最大金额"
          label="最大金额"
          size="sm"
          value={max?.toString() ?? ""}
          onValueChange={(e) => setMax(Number(e))}
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">¥</span>
            </div>
          }
        />
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <Button
          onClick={onReset}
          color="default"
          variant="flat"
          size="sm"
          radius="sm"
        >
          重置
        </Button>
        <Button
          isDisabled={min === undefined && max === undefined}
          onClick={() => {
            if (min === undefined && max === undefined) {
              setMinAmount(undefined);
              setMaxAmount(undefined);
            } else {
              setMinAmount(min);
              setMaxAmount(max);
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

export default AmountRangeFilter;
