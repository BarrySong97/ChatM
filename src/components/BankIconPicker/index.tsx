import { Button, Card, CardHeader, Divider, Input } from "@nextui-org/react";
import React, { FC, useState } from "react";
import bankcode from "./bank.json";
import ElectronImage from "../Image";

type BankCode = Array<{
  name: string;
  logo: string;
}>;

const typedBankcode: BankCode = bankcode;
export interface BankIconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  title?: string | React.ReactNode;
}
const BankIconPicker: FC<BankIconPickerProps> = ({
  value,
  onChange,
  title,
}) => {
  const [search, setSearch] = useState("");
  const [focusBank, setFocusBank] = useState<{
    logo: string;
    name: string;
  }>({
    logo: "",
    name: "",
  });

  return (
    <Card className="max-w-[300px]  py-2 px-2">
      <CardHeader className="px-0 pt-0 flex-col items-start">
        <div className="mb-2">{title ? title : "请选择一个银行"}</div>
        <Input
          size="sm"
          radius="sm"
          placeholder="请输入银行名称"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CardHeader>
      <div className=" h-[300px] overflow-y-auto scrollbar ">
        <div className="grid grid-cols-6 gap-2">
          {typedBankcode
            .filter((item) => item.name.includes(search))
            .map((item) => {
              return (
                <div key={item.name} className="cursor-pointer">
                  <Button
                    variant="light"
                    isIconOnly
                    size="sm"
                    radius="sm"
                    onClick={() => onChange?.(item.logo)}
                    onMouseEnter={() => setFocusBank(item)}
                  >
                    <ElectronImage
                      className="h-5 w-5"
                      src={item.logo}
                      alt={item.name}
                    />
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
      <Divider className="mt-2 mb-2" />
      <div className="flex items-center gap-2">
        {focusBank.logo ? (
          <ElectronImage
            className="h-10 w-10"
            src={focusBank.logo}
            alt={focusBank.name}
          />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded-sm"></div>
        )}
        <div className="text-base font-semibold">
          {focusBank.name ? focusBank.name : "请选择一个银行"}
        </div>
      </div>
    </Card>
  );
};

export default BankIconPicker;
