import { useQuery } from "react-query";
import { AssetsService } from "../services/AssetsSevice";
import { LiabilityService } from "../services/LiabilityService";
import { ExpenseService } from "../services/ExpenseService";
import { IncomeService } from "../services/IncomeService";
import { BookAtom } from "@/globals";
import { useAtomValue } from "jotai";
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
  const book = useAtomValue(BookAtom);
  const queryKey = ["side", filter.startDate, filter.endDate, book?.id];

  const { data: sideData } = useQuery<{
    assetsData: AssetsData;
    liabilitiesData: LiabilitiesData;
    expenditureData: ExpenditureData;
    incomeData: IncomeData;
  }>(queryKey, {
    queryFn: async () => {
      const assetsData = await AssetsService.getAssetsSumAmount(
        filter,
        book?.id ?? ""
      );
      const liabilitiesData = await LiabilityService.getLiabilitySumAmount(
        filter,
        book?.id ?? ""
      );
      const expenditureData = await ExpenseService.getExpenseSumAmount(
        filter,
        book?.id ?? ""
      );
      const incomeData = await IncomeService.getIncomeSumAmount(
        filter,
        book?.id ?? ""
      );
      return { assetsData, liabilitiesData, expenditureData, incomeData };
    },
    keepPreviousData: true,
    enabled: !!book,
  });

  return {
    assetsData: sideData?.assetsData,
    liabilitiesData: sideData?.liabilitiesData,
    expenditureData: sideData?.expenditureData,
    incomeData: sideData?.incomeData,
  };
}
