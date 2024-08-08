import { Divider } from "@nextui-org/react";
import React, { FC } from "react";
export interface PageProps {}
const Page: FC<PageProps> = () => {
  return (
    <div className="px-12 py-8 mt-6  mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">资产</h1>
        </div>
        {/* <Button onClick={onOpen} size="sm" color="primary">
          添加
        </Button> */}
      </div>
      <Divider className="my-6" />
    </div>
  );
};

export default Page;
