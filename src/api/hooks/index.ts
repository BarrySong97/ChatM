import { useQuery } from "react-query";
import { AssetsService } from "../services/AssetsSevice";
import { LiabilityService } from "../services/LiabilityService";
import { ExpenseService } from "../services/ExpenseService";
import { IncomeService } from "../services/IncomeService";
import {
  AssetsData,
  ExpenditureData,
  IncomeData,
  LiabilitiesData,
} from "./side";
export type NetWorthData = {
  amount: string;
  date: string;
};
export function useIndexData() {
  const queryKey = ["index"];

  const { data: sideData } = useQuery<{
    assetsData: AssetsData;
    liabilitiesData: LiabilitiesData;
    expenditureData: ExpenditureData;
    incomeData: IncomeData;
    netWorthData: NetWorthData[];
  }>(queryKey, {
    queryFn: async () => {
      const assetsData = await AssetsService.getAssetsSumAmount();
      const liabilitiesData = await LiabilityService.getLiabilitySumAmount();
      const expenditureData = await ExpenseService.getExpenseSumAmount();
      const incomeData = await IncomeService.getIncomeSumAmount();
      const netWorthData = await AssetsService.getNetWorth();
      return {
        assetsData,
        liabilitiesData,
        expenditureData,
        incomeData,
        netWorthData,
      };
    },
  });

  return {
    assetsData: sideData?.assetsData,
    liabilitiesData: sideData?.liabilitiesData,
    expenditureData: sideData?.expenditureData,
    incomeData: sideData?.incomeData,
    netWorthData: sideData?.netWorthData,
  };
}
