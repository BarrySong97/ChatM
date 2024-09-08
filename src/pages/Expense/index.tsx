import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenseCategoryService } from "@/api/hooks/expense";
import CategoryList from "@/components/CategoryList";
import { useIndexData } from "@/api/hooks";
import { PageWrapper } from "@/components/PageWrapper";
import { CategoryBarChart } from "@/components/PieChart";
import { ExpenseSectionCard } from "@/components/IndexSectionCard/ExpenseSectionCard";
import AccountModal from "@/components/AccountModal";

export interface PageProps {}

const date = new Date();

const Page: FC<PageProps> = () => {
  const navigate = useNavigate();

  const { expenditureData } = useIndexData();

  const [value, setValue] = useState<{
    start: number;
    end: number;
  }>({
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
  const { categoryData } = useExpenseCategoryService({
    startDate: value.start,
    endDate: value.end,
  });
  const [showAccountModal, setShowAccountModal] = useState(false);
  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">
            支出(总:{expenditureData?.totalAmount})
          </h1>
        </div>
        <Button
          size="sm"
          color="primary"
          onClick={() => setShowAccountModal(true)}
        >
          添加
        </Button>
      </div>
      <Divider className="my-6" />
      <div className="mt-8">
        <ExpenseSectionCard showLeft={false} showDefaultTitle />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类排行</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryList type="expense" items={categoryData ?? []} />
          </CardBody>
        </Card>
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类占比</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryBarChart
              data={
                categoryData?.map((v) => ({
                  content: v.content,
                  color: v.color,
                  amount: Number(v.amount) as unknown as string,
                })) ?? []
              }
            />
          </CardBody>
        </Card>
      </div>
      <AccountModal
        isOpen={showAccountModal}
        onOpenChange={(value) => {
          setShowAccountModal(value);
        }}
        type="expense"
      />
    </PageWrapper>
  );
};

export default Page;
