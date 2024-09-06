import { useQuery } from "react-query";
import { AssetsService } from "../services/AssetsSevice";
import { LiabilityService } from "../services/LiabilityService";
import { ExpenseService } from "../services/ExpenseService";
import { IncomeService } from "../services/IncomeService";
import { BookAtom } from "@/globals";
import { useAtomValue } from "jotai";
export type NetWorthData = {
  amount: string;
  date: string;
};
export function useIndexData() {
  const book = useAtomValue(BookAtom);
  const queryKey = ["index", book?.id];
  const { data: sideData } = useQuery(queryKey, {
    queryFn: async () => {
      const assetsData = await AssetsService.getAssetsSumAmount(
        undefined,
        book?.id
      );
      const liabilitiesData = await LiabilityService.getLiabilitySumAmount(
        undefined,
        book?.id
      );
      const expenditureData = await ExpenseService.getExpenseSumAmount(
        undefined,
        book?.id
      );
      const incomeData = await IncomeService.getIncomeSumAmount(
        undefined,
        book?.id
      );
      const netWorthData = await AssetsService.getNetWorth(book?.id);
      return {
        assetsData,
        liabilitiesData,
        expenditureData,
        incomeData,
        netWorthData,
      };
    },
    keepPreviousData: true,
    enabled: !!book,
  });

  return {
    assetsData: sideData?.assetsData,
    liabilitiesData: sideData?.liabilitiesData,
    expenditureData: sideData?.expenditureData,
    incomeData: sideData?.incomeData,
    netWorthData: sideData?.netWorthData,
  };
}
