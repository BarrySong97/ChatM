import { useUserService } from "@/api/hooks/user";
import ElectronImage from "@/components/Image";
import { BackgroundLines } from "@/components/ui/background-lines";
import { TextAnimate } from "@/components/ui/text-animat";
import { IPC_EVENT_KEYS } from "@/constant";
import { Avatar, Input, user } from "@nextui-org/react";
import { useDebounceFn } from "ahooks";
import React, { FC, useEffect, useState } from "react";
export interface InitBasicInfoProps {}
const InitBasicInfo: FC<InitBasicInfoProps> = () => {
  const { initUser, user, editUser } = useUserService();
  const [name, setName] = useState("");
  const [avatarSrc, setAvatarSrc] = useState("");
  useEffect(() => {
    setName(user?.name || "");
    setAvatarSrc(user?.avatar || "");
  }, [user]);
  const { run } = useDebounceFn(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (user?.id && name) {
        editUser({ userId: user?.id, userData: { name } });
      }
    },
    { wait: 500 }
  );
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="min-w-[300px]">
        <div className="flex items-center gap-4 mb-4">
          <TextAnimate
            text="欢迎来到流记 👋"
            className="text-2xl font-medium leading-9 text-default-foreground mt-0"
            type="whipInUp"
          />
        </div>
        <div className="flex items-center gap-4">
          <Avatar
            src={avatarSrc}
            onClick={async () => {
              const base64Image = await window.ipcRenderer.invoke(
                IPC_EVENT_KEYS.OPEN_FILE
              );
              if (base64Image) {
                // Store the image in IndexedDB
                setAvatarSrc(base64Image);
                if (user?.id) {
                  editUser({
                    userId: user?.id,
                    userData: { avatar: base64Image },
                  });
                }
              }
            }}
            alt=""
            className="min-w-[60px] min-h-[60px] rounded-lg object-cover cursor-pointer"
          />
          <Input
            variant="underlined"
            className="max-w-xl"
            label="请输入你的名字"
            size="lg"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              run(e);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default InitBasicInfo;
