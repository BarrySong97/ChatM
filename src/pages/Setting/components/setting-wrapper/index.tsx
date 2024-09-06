import React, { FC, ReactNode } from "react";
import { Divider } from "@nextui-org/react";

interface SettingWrapperProps {
  title: string | ReactNode;
  children: ReactNode;
}

const SettingWrapper: FC<SettingWrapperProps> = ({ title, children }) => {
  return (
    <div className="max-w-6xl mx-auto pt-0 pb-4 h-full overflow-auto scrollbar min-h-[489px]">
      <h2 className="text-lg font-semibold text-left">{title}</h2>
      <Divider className="my-4" />
      {children}
    </div>
  );
};

export default SettingWrapper;
