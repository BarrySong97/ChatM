import React, { FC } from "react";
import SettingWrapper from "../setting-wrapper";
import { Button } from "@nextui-org/react";
import Update from "@/components/update";
import ElectronImage from "@/components/Image";

export interface AboutProps {}
const About: FC<AboutProps> = () => {
  return (
    <SettingWrapper title="关于流记">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 ">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12  flex items-center justify-center">
              {/* Replace with actual logo */}
              <ElectronImage src={"/icon.png"} alt="logo" />
            </div>
          </div>
          <div>
            <div className="font-bold">流记</div>
            <div className="text-sm text-gray-500">
              当前版本: {process.env.PACKAGE_VERSION}
            </div>
          </div>
        </div>
        <Update />
      </div>
    </SettingWrapper>
  );
};

export default About;
