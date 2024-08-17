import { useQuery } from "react-query";
import { AssetsService } from "../services/AssetsSevice";
export type AssetsData = {
  totalAmount: string;
  assetAmounts: Map<string, string>;
};
export function useSideData() {
  const queryKey = ["side"];

  // Fetch user list
  const { data: assetsData } = useQuery<AssetsData>(queryKey, () =>
    AssetsService.getAssetsSumAmount()
  );

  // create asset

  return { assetsData };
}
