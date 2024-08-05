import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { notification } from "antd";
import React, { FC, useState } from "react";
import { setLogger } from "react-query";
export interface PopoverConfirmProps {
  onOk?: () => Promise<void>;
  onCancel?: () => void;
  children: React.ReactNode;
  showArrow?: boolean;
  placement?: "top" | "bottom" | "right" | "left";
  title: string | React.ReactNode;
  desc?: string | React.ReactNode;
}
const PopoverConfirm: FC<PopoverConfirmProps> = ({
  onCancel,
  onOk,
  showArrow,
  placement,
  children,
  title,
  desc,
}) => {
  const [loading, setloading] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      placement={placement}
      showArrow={showArrow}
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold mb-1">{title}</div>
          <div className="text-tiny">{desc}</div>
          <div className="flex justify-end mt-4 gap-2">
            <Button
              onClick={() => {
                onCancel?.();
                setIsOpen(false);
              }}
              size="sm"
              variant="flat"
            >
              取消
            </Button>
            <Button
              onClick={async () => {
                setloading(true);
                try {
                  await onOk?.();
                  setIsOpen(false);
                } catch (error) {
                  notification.error({
                    placement: "bottomRight",
                    message: (error as any).message,
                  });
                } finally {
                  setloading(false);
                }
              }}
              isLoading={loading}
              size="sm"
              color="danger"
            >
              确认
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverConfirm;
