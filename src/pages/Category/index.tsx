import { Card, CardBody, Divider } from "@nextui-org/react";
import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useAssetsService } from "@/api/hooks/assets";
import CategoryTransactionsTable from "@/components/CategoryTable";
import { useLiabilityService } from "@/api/hooks/liability";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import { PageWrapper } from "@/components/PageWrapper";
import { AssetsSectionCard } from "@/components/IndexSectionCard/AssetsSectionCard";
export interface CategoryProps {}
const date = new Date();
const Category: FC<CategoryProps> = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const { expenses } = useExpenseService();
  const { incomes } = useIncomeService();
  const item = [
    ...(assets || []),
    ...(liabilities || []),
    ...(expenses || []),
    ...(incomes || []),
  ].find((item) => item.id === id);

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
  console.log(id);

  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">
            {renderType()} - {item?.name}
          </h1>
          <div></div>
        </div>
      </div>
      <Divider className="my-6" />
      {/* <AssetsSectionCard /> */}
      <Card>
        <CardBody>
          <CategoryTransactionsTable accountId={id!} />
        </CardBody>
      </Card>
    </PageWrapper>
  );
};

export default Category;
