import { Card, CardBody, Divider } from "@nextui-org/react";
import { FC } from "react";
import { useParams } from "react-router-dom";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import { PageWrapper } from "@/components/PageWrapper";
import { AssetsSectionCard } from "@/components/IndexSectionCard/AssetsSectionCard";
import TransactionsTable from "@/components/Transactions";
import { LiabilitySectionCard } from "@/components/IndexSectionCard/LiabilitySectionCard";
import { IncomeSectionCard } from "@/components/IndexSectionCard/IncomeSectionCard";
import { ExpenseSectionCard } from "@/components/IndexSectionCard/ExpenseSectionCard";
import { useSideData } from "@/api/hooks/side";
export interface CategoryProps {}
const now = new Date();
const start = new Date(now.getFullYear(), now.getMonth(), 1);
const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
  const renderChartCard = () => {
    switch (type) {
      case "assets":
        return (
          <AssetsSectionCard
            showLeft={false}
            showSankey={true}
            showDefaultTitle
            accountId={id!}
          />
        );
      case "liabilities":
        return (
          <LiabilitySectionCard
            showLeft={false}
            showDefaultTitle
            showSankey={true}
            accountId={id!}
          />
        );
      case "income":
        return (
          <IncomeSectionCard
            showLeft={false}
            showDefaultTitle
            showSankey={true}
            accountId={id!}
          />
        );
      case "expense":
        return (
          <ExpenseSectionCard
            showLeft={false}
            showDefaultTitle
            showSankey={true}
            accountId={id!}
          />
        );
    }
  };
  const { assetsData, liabilitiesData, expenditureData, incomeData } =
    useSideData({
      startDate: start.getTime(),
      endDate: end.getTime(),
    });
  const renderPageTitle = () => {
    let totalAmount = "";
    if (type === "income") {
      totalAmount = `(总金额: ${incomeData?.incomeAmounts.get(id!) ?? "0.00"})`;
    }
    if (type === "expense") {
      totalAmount = `(总金额: ${
        expenditureData?.expenseAmounts.get(id!) ?? "0.00"
      })`;
    }
    return (
      <div>
        <h1 className="text-2xl font-bold">
          {renderType()} - {item?.name}
          {totalAmount}
        </h1>
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-end">{renderPageTitle()}</div>
      <Divider className="my-6" />

      {renderChartCard()}
      <Card>
        <CardBody>
          <TransactionsTable key={id} accountId={id!} />
        </CardBody>
      </Card>
    </PageWrapper>
  );
};

export default Category;
