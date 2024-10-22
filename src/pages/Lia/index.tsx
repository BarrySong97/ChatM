import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Tooltip,
} from "@nextui-org/react";
import { FC, useState } from "react";
import CategoryList from "@/components/CategoryList";
import { useIndexData } from "@/api/hooks";
import { useAssetCategoryService } from "@/api/hooks/assets";
import { PageWrapper } from "@/components/PageWrapper";
import { CategoryBarChart } from "@/components/PieChart";
import { LiabilitySectionCard } from "@/components/IndexSectionCard/LiabilitySectionCard";
import { useLiabilityCategoryService } from "@/api/hooks/liability";
import AccountModal from "@/components/AccountModal";
import dayjs from "dayjs";
import { useSetAtom } from "jotai";
import { AccountModalTypeAtom, ShowAccountModalAtom } from "@/globals";

export interface PageProps {}

const now = dayjs();
const Page: FC<PageProps> = () => {
  const [value, setValue] = useState({
    start: now.startOf("month").valueOf(),
    end: now.endOf("month").valueOf(),
  });
  const { categoryData } = useLiabilityCategoryService({
    startDate: value.start,
    endDate: value.end,
  });
  const { liabilitiesData } = useIndexData();
  const setShowAccountModal = useSetAtom(ShowAccountModalAtom);
  const setAccountType = useSetAtom(AccountModalTypeAtom);
  return (
    <PageWrapper>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">负债</h1>
        </div>
        <Tooltip delay={300} radius="sm" content="快捷键 Shift + L 唤起">
          <Button
            size="sm"
            color="primary"
            onClick={() => {
              setShowAccountModal(true);
              setAccountType("liability");
            }}
          >
            添加
          </Button>
        </Tooltip>
      </div>
      <Divider className="my-6" />
      <div className="mt-8">
        <LiabilitySectionCard
          showLeft={false}
          onValueChange={(value) => {
            setValue(value);
          }}
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
