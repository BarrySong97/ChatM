import { useUserService } from "@/api/hooks/user";
import { UserService } from "@/api/services/user";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
export interface FinishProps {}
const Finish: FC<FinishProps> = () => {
  const navigate = useNavigate();
  const { user } = useUserService();
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="text-3xl font-bold leading-9 mb-2 text-default-foreground">
        恭喜你完成初始化 👋
      </div>
      <div className="text-medium text-default-500">
        现在你可以开始使用流记了
      </div>
    </div>
  );
};

export default Finish;
