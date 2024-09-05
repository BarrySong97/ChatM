import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useAssetSankeyService, useAssetsService } from "@/api/hooks/assets";
import CategoryTransactionsTable from "@/components/CategoryTable";
import { useLiabilityService } from "@/api/hooks/liability";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import { PageWrapper } from "@/components/PageWrapper";
import { AssetsSectionCard } from "@/components/IndexSectionCard/AssetsSectionCard";
import { EChart } from "@kbox-labs/react-echarts";
import TransactionsTable from "@/components/Transactions";
export interface CategoryProps {}
const date = new Date();
const typeColorMap = {
  asset: "#AAD8D2",
  liability: "#F6E7C3",
  income: "#BFDCFD",
  expense: "#F3A5B6",
  assets: "#AAD8D2",
};
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
  const { sankeyData } = useAssetSankeyService(id!, type!);

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

      <Card className="mb-6">
        <CardHeader>资产流向图</CardHeader>
        <CardBody>
          {sankeyData?.nodes.length && sankeyData?.links.length ? (
            <EChart
              style={{
                height: "300px",
                width: "100%",
              }}
              tooltip={{
                trigger: "item",
                triggerOn: "mousemove",
              }}
              series={[
                {
                  type: "sankey",
                  nodeAlign: "left",

                  emphasis: {
                    focus: "adjacency",
                  },
                  data:
                    sankeyData?.nodes?.map((v) => {
                      return {
                        ...v,
                        itemStyle: {
                          // color: "#E4E4E5",
                          // borderColor: "#E4E4E5",
                          borderColor:
                            typeColorMap[v.type as keyof typeof typeColorMap],
                          color:
                            typeColorMap[v.type as keyof typeof typeColorMap],
                        },
                      };
                    }) ?? [],
                  links:
                    sankeyData?.links?.map((v) => {
                      return {
                        ...v,
                        lineStyle: {
                          color: v.flow !== "in" ? "#F3A5B6" : "#BFDCFD",
                        },
                      };
                    }) ?? [],
                  lineStyle: {
                    color: "#F3A5B6",
                    curveness: 0.5,
                  },

                  itemStyle: {
                    color: "#1f77b4",
                    borderColor: "#1f77b4",
                  },
                  label: {
                    color: "rgba(0,0,0,0.7)",
                    fontFamily: "Arial",
                    fontSize: 16,
                  },
                },
              ]}
            />
          ) : (
            <div className="h-[300px]"></div>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <TransactionsTable key={id} accountId={id!} />
        </CardBody>
      </Card>
    </PageWrapper>
  );
};

export default Category;
