import { useUserService } from "@/api/hooks/user";
import TextAnimate from "@/components/ui/text-animat";
import { usePublicPath } from "@/hooks";
import React, { FC } from "react";
export interface FinishProps {}
const Finish: FC<FinishProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <TextAnimate
        text="恭喜你完成初始化 🌸"
        className="text-3xl font-bold leading-9 text-default-foreground mt-0"
        type="whipInUp"
      />
      {/* <div className="text-3xl font-bold leading-9 mb-2 text-default-foreground">
        恭喜你完成初始化 🌸
      </div> */}
      <div className="text-medium text-default-500">
        现在你可以开始使用流记了
      </div>
    </div>
  );
};

export default Finish;
