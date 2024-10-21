"use client";

import React from "react";
import { AvatarGroup, Avatar, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { cn } from "./cn";

export type SupportCardProps = React.HTMLAttributes<HTMLDivElement>;

const SupportCard = React.forwardRef<HTMLDivElement, SupportCardProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(
        "align-center my-2 flex shrink-0 items-center justify-center gap-3 self-stretch rounded-large bg-content1 px-3 py-3 shadow-small",
        className
      )}
    >
      <AvatarGroup isBordered size="sm">
        <Avatar
          classNames={{
            base: "ring-0 ring-offset-1 w-[25px] h-[25px]",
          }}
          src="https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo3163sn2r8io005p04oqpqavue7t1d5e0?imageView2/2/w/540/format/webp|imageMogr2/strip2"
        />
      </AvatarGroup>
      <div className="line-clamp-2 text-left text-tiny font-medium text-default-700">
        加作者微信，直接反馈
      </div>
      <Button
        isIconOnly
        className="align-center flex h-[32px] w-[31px] justify-center rounded-[12px] bg-default-100 dark:bg-[#27272A]/[.4]"
        size="sm"
        variant="flat"
      >
        <Icon
          className="text-default-400 dark:text-foreground [&>g>path:nth-child(1)]:stroke-[3px] [&>g>path:nth-child(2)]:stroke-[2.5px]"
          icon="solar:chat-round-dots-linear"
          width={20}
        />
      </Button>
    </div>
  )
);

SupportCard.displayName = "SupportCard";

export default SupportCard;
