import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAssetCategoryService } from "@/api/hooks/assets";
import CategoryList from "@/components/CategoryList";
import { useIndexData } from "@/api/hooks";
import { PageWrapper } from "@/components/PageWrapper";
import { AssetsSectionCard } from "@/components/IndexSectionCard/AssetsSectionCard";
import { CategoryBarChart } from "@/components/PieChart";
export interface PageProps {}
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}
const now = new Date().getTime();
const Page: FC<PageProps> = () => {
  const { categoryData } = useAssetCategoryService({
    startDate: now,
    endDate: now,
  });

  const { assetsData } = useIndexData();
  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">资产 </h1>
        </div>
        <Button size="sm" color="primary">
          添加
        </Button>
      </div>
      <Divider className="my-6" />
      <div className="mt-8">
        <AssetsSectionCard
          title={
            <div className="pl-4 font-semibold text-lg">
              金额：{assetsData?.totalAmount}
            </div>
          }
          showLeft={false}
        />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类排行</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryList items={categoryData ?? []} />
          </CardBody>
        </Card>
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类占比</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryBarChart
              data={
                categoryData?.map((v, index) => ({
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
