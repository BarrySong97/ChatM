import React, { FC } from "react";
import SettingWrapper from "../setting-wrapper";
import { Button } from "@nextui-org/react";
import Update from "@/components/update";

export interface AboutProps {}
const About: FC<AboutProps> = () => {
  return (
    <SettingWrapper title="关于流记">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 ">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              {/* Replace with actual logo */}
              <svg
                className="w-8 h-8 text-gray-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          <div>
            <div className="font-bold">流记1</div>
            <div className="text-sm text-gray-500">0.0.1-alpha</div>
          </div>
        </div>
        <Update />
      </div>
    </SettingWrapper>
  );
};

export default About;
