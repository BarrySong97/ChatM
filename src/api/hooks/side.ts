import { useQuery } from "react-query";
import { AssetsService } from "../services/AssetsSevice";
import { LiabilityService } from "../services/LiabilityService";
import { ExpenseService } from "../services/ExpenseService";
import { IncomeService } from "../services/IncomeService";
export type AssetsData = {
  totalAmount: string;
  assetAmounts: Map<string, string>;
};
export type LiabilitiesData = {
  totalAmount: string;
  liabilityAmounts: Map<string, string>;
};

export type ExpenditureData = {
  totalAmount: string;
  expenseAmounts: Map<string, string>;
};

export type IncomeData = {
  totalAmount: string;
  incomeAmounts: Map<string, string>;
};
export type SideFilter = {
  startDate?: number;
  endDate: number;
  accountId?: string;
};

export function useSideData(filter: SideFilter) {
  const queryKey = ["side", filter];

  const { data: sideData } = useQuery<{
    assetsData: AssetsData;
    liabilitiesData: LiabilitiesData;
    expenditureData: ExpenditureData;
    incomeData: IncomeData;
  }>(queryKey, {
    queryFn: async () => {
      const assetsData = await AssetsService.getAssetsSumAmount(filter);
      const liabilitiesData = await LiabilityService.getLiabilitySumAmount(
        filter
      );
      const expenditureData = await ExpenseService.getExpenseSumAmount(filter);
      const incomeData = await IncomeService.getIncomeSumAmount(filter);

      return { assetsData, liabilitiesData, expenditureData, incomeData };
    },
  });

  return {
    assetsData: sideData?.assetsData,
    liabilitiesData: sideData?.liabilitiesData,
    expenditureData: sideData?.expenditureData,
    incomeData: sideData?.incomeData,
  };
}
