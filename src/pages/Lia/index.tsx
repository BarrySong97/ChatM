import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import LiaDetailSectionCard from "./components/section-card"; // You'll need to create this component
import { Category } from "../Index/components/category";
import CategoryList from "@/components/CategoryList";
import { useIndexData } from "@/api/hooks";
import { useAssetCategoryService } from "@/api/hooks/assets";
import { PageWrapper } from "@/components/PageWrapper";

export interface PageProps {}

const now = new Date().getTime();
const Page: FC<PageProps> = () => {
  const navigate = useNavigate();

  const { categoryData } = useAssetCategoryService({
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
        <LiaDetailSectionCard
          title={
            <div>
              <div className="text-sm font-medium text-gray-500">负债总额</div>
              <div className="text-gray-900 text-3xl font-medium">
                {liabilitiesData?.totalAmount}
              </div>
            </div>
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类占比</CardHeader>
          <CardBody className="min-h-[200px]">
            <Category
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
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类排行</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryList items={categoryData ?? []} />
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Page;
