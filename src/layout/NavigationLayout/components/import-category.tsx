import React, { FC } from "react";
import { CategoryTypes } from "./category-adpter";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { message } from "antd";
export type ImportCategory = {
  name: string;
  key: string;
  icon: React.ReactNode;
};
export type InputCategoryProps = {
  data: ImportCategory;
  onClick: (key: string) => void;
};
const InputCategory: FC<InputCategoryProps> = ({ data, onClick }) => {
  return (
    <Card
      onClick={() => {
        if (data.key === "china_bank") {
          message.error("该功能正在开发中");
          return;
        }
        onClick(data.key);
      }}
      shadow="sm"
      radius="sm"
      isHoverable
      isPressable
    >
      <CardHeader className="flex justify-center items-center pb-0">
        {data.icon}
      </CardHeader>
      <CardBody className="text-center font-semibold  sm text-default-foreground text-[15px]">
        {data.name}
      </CardBody>
    </Card>
  );
};

export type InputCategoryListProps = {
  onChange: (key: string) => void;
};
const InputCategoryList: FC<InputCategoryListProps> = ({ onChange }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {CategoryTypes.map((item) => (
        <InputCategory onClick={onChange} key={item.key} data={item} />
      ))}
    </div>
  );
};

export { InputCategory, InputCategoryList };
