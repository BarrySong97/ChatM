import React from "react";
import SettingWrapper from "../setting-wrapper";
import ProviderCard from "./ProviderCard";
import { useProviderService } from "@/api/hooks/provider";

const AISetting: React.FC = () => {
  const { providers, isLoadingProviders } = useProviderService();

  if (isLoadingProviders) {
    return <div>Loading...</div>;
  }

  return (
    <SettingWrapper title="AI设置">
      <div className="space-y-6 px-1">
        {providers
          ?.sort((a, b) =>
            a.name === "DeepSeek" ? -1 : b.name === "DeepSeek" ? 1 : 0
          )
          .map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
      </div>
    </SettingWrapper>
  );
};

export default AISetting;
