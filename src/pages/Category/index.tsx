import { Divider } from "@nextui-org/react";
import { FC } from "react";
import ExpenseSectionCard from "../Index/components/expense-section-card";
export interface CategoryProps {}
const Category: FC<CategoryProps> = () => {
  return (
    <div className="px-12 py-8   mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">资产 - 微信</h1>
        </div>
      </div>
      <Divider className="my-6" />
    </div>
  );
};

export default Category;
