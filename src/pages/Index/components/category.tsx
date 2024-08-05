import React, { FC } from "react";
import { atom, useAtom } from "jotai";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { flowAtom } from "..";

export const showPriceAtom = atom(false);
interface ItemProps {
  category: string;
  price?: number;
  percent?: number;
  onContextMenu?: () => void;
  type?: number;
}

const color = ["text-green-500", "text-red-500", "text-yellow-500"];
export const Item: React.FC<ItemProps> = ({
  category,
  price,
  percent,
  onContextMenu,
  type = 1,
}) => {
  const [showPrice] = useAtom(showPriceAtom);
  const [flow] = useAtom(flowAtom);
  const displayValue =
    showPrice && price !== undefined
      ? price > 1000
        ? `${(price / 1000).toFixed(1)}k`
        : price.toString()
      : percent !== undefined
      ? `${percent}%`
      : "";

  const valueClass = color[type];
  return (
    <div
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onContextMenu?.();
      }}
      className="flex justify-between items-center py-2 text-sm"
    >
      <span className="text-gray-500  xl:w-full truncate w-[120px] ">
        {category}
      </span>

      <span className={` ${valueClass}`}>{displayValue}</span>
    </div>
  );
};
interface ContainerProps {
  data: { category: string; price?: number; percent?: number }[];
}

const Container: React.FC<ContainerProps> = ({ data }) => {
  const leftData = data.slice(0, Math.ceil(data.length / 2));
  const rightData = data.slice(Math.ceil(data.length / 2));

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        {leftData.map((item, index) => (
          <Item key={index} {...item} />
        ))}
      </div>
      <div className="flex-1">
        {rightData.map((item, index) => (
          <Item key={index} {...item} />
        ))}
      </div>
    </div>
  );
};
export interface CategoryProps {}
const Category: FC<CategoryProps> = () => {
  const data = [
    { category: "Communication Services", percent: 0.96, price: 100 },
    { category: "Consumer Cyclical", percent: 0.34, price: 100 },
    { category: "Consumer Defensive", percent: 0.28, price: 100 },
    { category: "Technology", percent: 0.04, price: 100 },
    { category: "Energy", percent: 0.17, price: 100 },
    { category: "Financial", percent: 0.23, price: 100 },
    { category: "Healthcare", percent: 0.38, price: 100 },
    { category: "Basic Materials", percent: 0.5, price: 1004 },
    { category: "Basic Materials1", percent: 0.5, price: 1004 },
    { category: "Basic Materials2", percent: 0.5, price: 1004 },
  ];
  const [showPrice, setShowPrice] = useAtom(showPriceAtom);
  return (
    <Card shadow="sm" className="flex-1" radius="sm">
      <CardHeader className="flex gap-3 justify-between">
        <h2 className="text-base text-stone-900 font-medium">
          消费最多的10个类别
        </h2>
        <div
          onClick={() => {
            setShowPrice(!showPrice);
          }}
          className="text-xs select-none cursor-pointer text-gray-400 underline underline-offset-4"
        >
          显示{showPrice ? "百分比" : "金额"}
        </div>
      </CardHeader>
      <CardBody className="py-0">
        <Container data={data} />
      </CardBody>
    </Card>
  );
};

export default Category;
