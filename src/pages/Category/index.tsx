import { Divider } from "@nextui-org/react";
import { FC } from "react";
import { type Category, category } from "../../../electron/db/schema";
import SectionCard from "../Index/components/SectionCard";
export interface CategoryProps {}
const Category: FC<CategoryProps> = () => {
  return (
    <div className="px-12 py-8 mt-6  mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">资产 - 微信</h1>
        </div>
      </div>
      <Divider className="my-6" />
      <SectionCard
        showLeft={false}
        title={
          <div>
            <div className="text-sm font-medium text-gray-500"> 微信 </div>
            <div className="text-gray-900 text-3xl font-medium">100M</div>
          </div>
        }
      />
    </div>
  );
};

export default Category;
