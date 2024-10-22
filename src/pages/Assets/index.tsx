import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Tooltip,
} from "@nextui-org/react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssetCategoryService } from "@/api/hooks/assets";
import CategoryList from "@/components/CategoryList";
import { useIndexData } from "@/api/hooks";
import { PageWrapper } from "@/components/PageWrapper";
import { AssetsSectionCard } from "@/components/IndexSectionCard/AssetsSectionCard";
import { CategoryBarChart } from "@/components/PieChart";
import AccountModal from "@/components/AccountModal";
import dayjs from "dayjs";
import { useSetAtom } from "jotai";
import { AccountModalTypeAtom, ShowAccountModalAtom } from "@/globals";
export interface PageProps {}
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}
const now = dayjs();
const Page: FC<PageProps> = () => {
  const [value, setValue] = useState({
    start: now.startOf("month").valueOf(),
    end: now.endOf("month").valueOf(),
  });
  const { categoryData } = useAssetCategoryService({
    startDate: value.start,
    endDate: value.end,
  });

  const setShowAccountModal = useSetAtom(ShowAccountModalAtom);
  const setAccountType = useSetAtom(AccountModalTypeAtom);

  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">资产 </h1>
        </div>
        <Tooltip delay={300} radius="sm" content="快捷键 Shift + A 唤起">
          <Button
            size="sm"
            color="primary"
            onClick={() => {
              setShowAccountModal(true);
              setAccountType("asset");
            }}
          >
            添加
          </Button>
        </Tooltip>
      </div>
      <Divider className="my-6" />
      <div className="mt-8">
        <AssetsSectionCard
          // title={
          //   <div className="pl-4 font-semibold text-lg">
          //     金额：{assetsData?.totalAmount}
          //   </div>
          // }
          onValueChange={(value) => {
            setValue(value);
          }}
          showLeft={false}
        />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <Card shadow="sm" radius="sm">
          <CardHeader className="">分类排行</CardHeader>
          <CardBody className="min-h-[200px]">
            <CategoryList type="asset" items={categoryData ?? []} />
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
