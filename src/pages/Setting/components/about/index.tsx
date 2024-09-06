import React, { FC } from "react";
import SettingWrapper from "../setting-wrapper";
export interface AboutProps {}
const About: FC<AboutProps> = () => {
  return (
    <SettingWrapper title="关于流记">
      <div>2</div>
    </SettingWrapper>
  );
};

export default About;
