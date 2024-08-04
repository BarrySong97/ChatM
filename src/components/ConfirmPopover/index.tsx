import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import React, { FC, ReactNode } from "react";
export interface ConfirmPopoverProps {
  content?: ReactNode;
  title: string;
  children: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
}
const ConfirmPopover: FC<ConfirmPopoverProps> = ({
  children,
  content,
  onConfirm,
  onCancel,
  title,
}) => {
  return (
    <Popover placement="right">
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">{title}</div>
          <div className="flex gap-2">
            <Button>Cancel</Button>
            <Button color="primary">Confirm</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConfirmPopover;
