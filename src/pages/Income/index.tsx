import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIncomeCategoryService } from "@/api/hooks/income";
import CategoryList from "@/components/CategoryList";
import { useIndexData } from "@/api/hooks";
import { PageWrapper } from "@/components/PageWrapper";
import { IncomeSectionCard } from "@/components/IndexSectionCard/IncomeSectionCard";
import { CategoryBarChart } from "@/components/PieChart";
import AccountModal from "@/components/AccountModal";
import dayjs from "dayjs";

export interface PageProps {}

const now = dayjs();

const Page: FC<PageProps> = () => {
  const { incomeData } = useIndexData();

  const [value, setValue] = useState<{
    start: number;
    end: number;
  }>({
    start: now.startOf("month").valueOf(),
    end: now.endOf("month").valueOf(),
  });
  const { categoryData } = useIncomeCategoryService({
    startDate: value.start,
    endDate: value.end,
  });
  const [showAccountModal, setShowAccountModal] = useState(false);
  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">
            收入(总:{incomeData?.totalAmount})
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
        <IncomeSectionCard
          showLeft={false}
          showDefaultTitle
          onValueChange={(value) => {
            setValue(value);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类排行</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryList type="income" items={categoryData ?? []} />
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
        type="income"
      />
    </PageWrapper>
  );
};

export default Page;
