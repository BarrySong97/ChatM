import { Divider } from "@nextui-org/react";
import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useAssetsService } from "@/api/hooks/assets";
import AssetsSubDetailSectionCard from "./components/assets-section-card";
export interface CategoryProps {}
const date = new Date();
const Category: FC<CategoryProps> = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const { asset } = useAssetsService(id!);
  const renderType = () => {
    if (type === "assets") {
      return "资产";
    }
    if (type === "liabilities") {
      return "负债";
    }
    if (type === "income") {
      return "收入";
    }
    if (type === "expense") {
      return "支出";
    }
    return null; // Default case if type doesn't match any condition
  };
  const [value, setValue] = useState<{ start: number; end: number }>({
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime(),
    end: new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      0,
      0,
      0
    ).getTime(),
  });

  return (
    <div className="px-12 py-8   mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">
            {renderType()} - {asset?.name}
          </h1>
          <div></div>
        </div>
      </div>
      <Divider className="my-6" />
      <AssetsSubDetailSectionCard setValue={setValue} value={value} />
    </div>
  );
};

export default Category;
