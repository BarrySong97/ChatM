import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import { FC } from "react";
import ExpenseSectionCard from "../Index/components/expense-section-card";
import { Space, Table, TableProps } from "antd";
import {
  IcBaselineWechat,
  MaterialSymbolsArrowForwardIosRounded,
} from "@/assets/icon";
import { CategoryListLineChart } from "./components/line";
import { useNavigate } from "react-router-dom";
import AssetsSectionCard from "../Index/components/assets-section-card";
import AssetsDetailSectionCard from "./components/section-card";
import { useAssetCategoryService } from "@/api/hooks/assets";
import CategoryList from "@/components/CategoryList";
import { CategoryBarChart } from "../Index/components/category";
import { useIndexData } from "@/api/hooks";
import { PageWrapper } from "@/components/PageWrapper";
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
  const navigate = useNavigate();
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
        <AssetsDetailSectionCard
          title={
            <div>
              <div className="text-sm font-medium text-gray-500"> 总资产 </div>
              <div className="text-gray-900 text-3xl font-medium">
                {assetsData?.totalAmount}
              </div>
            </div>
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-8">
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
