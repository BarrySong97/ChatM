import React, { useEffect, useState } from "react";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { useProviderService } from "@/api/hooks/provider";
import { useModelService } from "@/api/hooks/model";
import { Provider, Model } from "@db/schema";
import { AIServiceParams } from "@/api/services/AIService";

interface TitleComponentProps {
  totalCount: number;
  processedCount: number;
  processLoading: boolean;
  onAIProcess: (
    params: Omit<
      AIServiceParams,
      "expense" | "income" | "liabilities" | "assets" | "data" | "importSource"
    >
  ) => void;
}

const TitleComponent: React.FC<TitleComponentProps> = ({
  totalCount,
  processedCount,
  processLoading,
  onAIProcess,
}) => {
  const { providers, isLoadingProviders, editProvider } = useProviderService();
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const { models, isLoadingModels } = useModelService(selectedProvider);
  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    if (providers && providers.length > 0) {
      const defaultProvider = providers.find((p) => p.is_default === 1);
      if (defaultProvider) {
        setSelectedProvider(defaultProvider.id);
      }
    }
    const savedModel = localStorage.getItem("selectedModel");
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, [providers]);

  const handleProviderChange = async (providerId: string) => {
    setSelectedProvider(providerId);
    await editProvider({ providerId, provider: { is_default: 1 } });
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem("selectedModel", modelId);
  };

  const processedPercent = Math.round((processedCount / totalCount) * 100);
  const remainingCount = totalCount - processedCount;
  const selectProviderItem = providers?.find(
    (provider) => provider.id === selectedProvider
  );
  const selectModelItem = models?.find((model) => model.id === selectedModel);

  return (
    <div className="flex justify-between items-center">
      <div>
        共{totalCount}条数据
        {processLoading ? (
          <>
            ，已处理{processedCount}条，剩余{remainingCount}条，进度
            {processedPercent}%
          </>
        ) : null}
      </div>
      <div className="flex items-center space-x-4">
        <Select
          className="w-[200px]"
          size="sm"
          selectedKeys={selectedProvider ? [selectedProvider] : []}
          onSelectionChange={(keys) =>
            handleProviderChange(Array.from(keys)[0] as string)
          }
          isLoading={isLoadingProviders}
        >
          {providers?.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name}
            </SelectItem>
          )) ?? []}
        </Select>
        <Select
          className="w-[200px]"
          size="sm"
          selectedKeys={selectedModel ? [selectedModel] : []}
          onSelectionChange={(keys) =>
            handleModelChange(Array.from(keys)[0] as string)
          }
          isLoading={isLoadingModels}
        >
          {models?.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          )) ?? []}
        </Select>

        <Button
          onClick={() =>
            onAIProcess({
              provider: selectedProvider,
              model: selectModelItem?.name ?? "",
              apiKey: selectProviderItem?.apiKey ?? "",
              baseURL: selectProviderItem?.baseUrl ?? "",
            })
          }
          radius="sm"
          isDisabled={
            !totalCount ||
            processLoading ||
            !selectProviderItem?.apiKey ||
            !selectProviderItem?.baseUrl
          }
          size="sm"
          isLoading={processLoading}
          color="primary"
        >
          一键AI处理
        </Button>
      </div>
    </div>
  );
};

export default TitleComponent;
