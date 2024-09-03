import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import CategoryList from "@/components/CategoryList";
import { useIndexData } from "@/api/hooks";
import { useAssetCategoryService } from "@/api/hooks/assets";
import { PageWrapper } from "@/components/PageWrapper";
import { CategoryBarChart } from "@/components/PieChart";
import { LiabilitySectionCard } from "@/components/IndexSectionCard/LiabilitySectionCard";
import { useLiabilityCategoryService } from "@/api/hooks/liability";

export interface PageProps {}

const now = new Date().getTime();
const Page: FC<PageProps> = () => {
  const { categoryData } = useLiabilityCategoryService({
    startDate: now,
    endDate: now,
  });
  const { liabilitiesData } = useIndexData();
  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">负债</h1>
        </div>
        <Button size="sm" color="primary">
          添加
        </Button>
      </div>
      <Divider className="my-6" />
      <div className="mt-8">
        <LiabilitySectionCard
          title={
            <div className="pl-4 font-semibold text-lg">
              金额：{liabilitiesData?.totalAmount}
            </div>
          }
          showLeft={false}
        />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类排行</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryList type="liability" items={categoryData ?? []} />
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
    </PageWrapper>
  );
};

export default Page;
