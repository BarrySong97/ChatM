"use client";

import React from "react";
import { Button, Link } from "@nextui-org/react";
import { Icon } from "@iconify/react";

/**
 * You need to make sure to add some padding at the bottom of the page to avoid overlapping.
 */
export default function FloatingAtBottomAndCenteredBanner({
  onSkip,
}: {
  onSkip: () => void;
}) {
  return (
    <div className="pointer-events-none  w-full px-2 pb-2 sm:flex sm:justify-center sm:px-4 sm:pb-4 lg:px-8">
      <div className="pointer-events-auto flex items-center gap-x-3 rounded-large border-1 border-divider bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 px-6 py-2 sm:px-3.5">
        <div className="flex w-full items-center gap-x-3">
          <p className="text-small text-foreground">
            <Link className="text-inherit" href="#">
              如果你不需要AI分类流水功能，可以跳过此步骤，直接创建账户分类
            </Link>
          </p>
          <Button
            color="default"
            endContent={
              <Icon
                className="flex-none outline-none transition-transform group-data-[hover=true]:translate-x-0.5 [&>path]:stroke-[2]"
                icon="solar:arrow-right-linear"
                width={16}
              />
            }
            onClick={onSkip}
            style={{
              border: "solid 2px transparent",
              backgroundImage: `linear-gradient(hsl(var(--nextui-primary-50)), hsl(var(--nextui-primary-50))), linear-gradient(to right, #3B82F6, #2563EB)`,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }}
            variant="bordered"
          >
            跳过
          </Button>
        </div>
      </div>
    </div>
  );
}
