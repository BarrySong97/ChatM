"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { cn } from "./cn";
import SupportCard from "./support-card";
import VerticalSteps from "./vertical-steps";

import RowSteps from "./row-steps";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import DragTitle from "@/components/DragTitle";
import TrafficLight from "@/components/TrafficLight";

export type MultiStepSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  currentPage: number;
  onBack: () => void;
  onNext: () => void;
  onChangePage: (page: number) => void;
};

const stepperClasses = cn(
  // light
  "[--step-color:hsl(var(--nextui-primary-400))]",
  "[--active-color:hsl(var(--nextui-primary-400))]",
  "[--inactive-border-color:hsl(var(--nextui-primary-200))]",
  "[--inactive-bar-color:hsl(var(--nextui-primary-200))]",
  "[--inactive-color:hsl(var(--nextui-primary-300))]",
  // dark
  "dark:[--step-color:rgba(255,255,255,0.1)]",
  "dark:[--active-color:hsl(var(--nextui-foreground-600))]",
  "dark:[--active-border-color:rgba(255,255,255,0.5)]",
  "dark:[--inactive-border-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-bar-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-color:rgba(255,255,255,0.2)]"
);

const MultiStepSidebar = React.forwardRef<
  HTMLDivElement,
  MultiStepSidebarProps
>(
  (
    {
      children,
      className,
      currentPage,
      onBack,
      onNext,
      onChangePage,
      ...props
    },
    ref
  ) => {
    const isMac = window.platform.getOS() === "darwin";
    return (
      <>
        <div
          style={{
            width: "100%",
          }}
          className="absolute left-0 right-0 dark:bg-transparent h-[28px]"
        >
          <DragTitle className="absolute  dark:bg-transparent   top-0 w-full  py-3.5 flex justify-end  ">
            <TrafficLight isDev={false} />
          </DragTitle>
        </div>

        <div
          ref={ref}
          className={cn(
            "flex bg-white h-[100vh] w-full  gap-x-2",
            className,
            {}
          )}
          {...props}
        >
          <div
            className={cn(
              "flex hidden h-full  w-[344px] flex-shrink-0 flex-col items-start gap-y-4 rounded-large bg-gradient-to-b from-default-100 via-primary-100 to-primary-100 px-8 py-6 shadow-small lg:flex",
              {
                "pt-10": isMac,
              }
            )}
          >
            <Button
              className="bg-default-50 text-small font-medium text-default-500 shadow-lg"
              isDisabled={currentPage === 0}
              radius="full"
              variant="flat"
              onPress={onBack}
            >
              <Icon icon="solar:arrow-left-outline" width={18} />
              上一步
            </Button>
            {/* Desktop Steps */}
            <VerticalSteps
              className={stepperClasses}
              currentStep={currentPage}
              steps={[
                {
                  title: "填写API key",
                  description: "用于连接大模型",
                },
                {
                  title: "创建资产账户",
                  description: "用于记录资产",
                },
                {
                  title: "创建负债账户",
                  description: "用于记录负债",
                },
                {
                  title: "创建收入账户",
                  description: "用于记录收入",
                },
                {
                  title: "创建支出账户",
                  description: "用于记录支出",
                },
                {
                  title: "创建标签",
                  description: "用于记录标签",
                },
                {
                  title: "完成",
                  description: "完成初始化",
                },
              ]}
              onStepChange={onChangePage}
            />
            <SupportCard className="w-full backdrop-blur-lg lg:bg-white/40 lg:shadow-none dark:lg:bg-white/20" />
          </div>
          <div className="flex h-full w-full flex-col  gap-4 md:p-4">
            <div className="sticky top-0 z-10 w-full rounded-large bg-gradient-to-r from-default-100 via-danger-100 to-secondary-100 py-4 shadow-small md:max-w-xl lg:hidden">
              <div className="flex justify-center">
                {/* Mobile Steps */}
                <RowSteps
                  className={cn("pl-6", stepperClasses)}
                  currentStep={currentPage}
                  steps={[
                    {
                      title: "Account",
                    },
                    {
                      title: "Information",
                    },
                    {
                      title: "Address",
                    },
                    {
                      title: "Payment",
                    },
                  ]}
                  onStepChange={onChangePage}
                />
              </div>
            </div>
            <div className="h-full w-full p-4 ">
              {children}
              <MultistepNavigationButtons
                backButtonProps={{ isDisabled: currentPage === 0 }}
                className="lg:hidden"
                nextButtonProps={{
                  children:
                    currentPage === 0
                      ? "Sign Up for Free"
                      : currentPage === 3
                      ? "Go to Payment"
                      : "Continue",
                }}
                onBack={onBack}
                onNext={onNext}
              />
              <SupportCard className="mx-auto w-full max-w-[252px] lg:hidden" />
            </div>
          </div>
        </div>
      </>
    );
  }
);

MultiStepSidebar.displayName = "MultiStepSidebar";

export default MultiStepSidebar;
