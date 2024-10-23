import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Link,
  Select,
  SelectItem,
  Tooltip,
} from "@nextui-org/react";
import { useProviderService } from "@/api/hooks/provider";
import { useModelService } from "@/api/hooks/model";
import { Provider, Model } from "@db/schema";
import { AIServiceParams } from "@/api/services/AIService";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  LicenseAtom,
  SettingActiveKeyAtom,
  ShowSettingModalAtom,
} from "@/globals";
import { useLocalStorageState } from "ahooks";
import { License } from "@/api/models/license";
import { MaterialSymbolsContactSupportOutline } from "./icon";
import { useQueryClient } from "react-query";

interface TitleComponentProps {
  totalCount: number;
  processedCount: number;
  processLoading: boolean;
  abortControllerRef: React.RefObject<AbortController[]>;
  isAbort: React.MutableRefObject<boolean>;
  onAIProcess: (
    params: Omit<
      AIServiceParams,
      "expense" | "income" | "liabilities" | "assets" | "data" | "importSource"
    >
  ) => void;
}

const TitleComponent: React.FC<TitleComponentProps> = ({
  abortControllerRef,
  totalCount,
  processedCount,
  processLoading,
  isAbort,
  onAIProcess,
}) => {
  const { providers, isLoadingProviders, editProvider } = useProviderService();
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const { models } = useModelService(selectedProvider);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const ref = useRef<number>(0);
  const [concurrency, setConcurrency] = useState<number>(30);

  useEffect(() => {
    if (providers && providers.length > 0 && ref.current === 0) {
      const defaultProvider = providers.find((p) => p.is_default === 1);

      if (defaultProvider) {
        setSelectedProvider(defaultProvider.id);
      }
      const defaultConcurrency = defaultProvider?.concurrency ?? 30;
      setConcurrency(defaultConcurrency);
      const savedModel = localStorage.getItem(
        `selectedModel-${defaultProvider?.id}`
      );

      if (savedModel) {
        setSelectedModel(savedModel);
      }
      ref.current = 1;
    }
  }, [providers]);
  const handleProviderChange = async (providerId: string) => {
    setSelectedProvider(providerId);
    setConcurrency(
      providers?.find((p) => p.id === providerId)?.concurrency ?? 30
    );
    await editProvider({
      providerId,
      provider: { is_default: 1 },
    });
    const savedModel = localStorage.getItem(`selectedModel-${providerId}`);
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  };

  const selectModelItem = models?.find((model) => model.id === selectedModel);
  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem(`selectedModel-${selectedProvider}`, modelId);
    await editProvider({
      providerId: selectedProvider,
      provider: { defaultModel: selectModelItem?.name ?? "" },
    });
  };
  const handleConcurrencyChange = async (concurrency: number) => {
    setConcurrency(concurrency);
    await editProvider({
      providerId: selectedProvider,
      provider: { concurrency },
    });
  };

  const processedPercent = Math.round((processedCount / totalCount) * 100);
  const remainingCount = totalCount - processedCount;
  const selectProviderItem = providers?.find(
    (provider) => provider.id === selectedProvider
  );
  const setSettingModal = useSetAtom(ShowSettingModalAtom);
  const setActiveKey = useSetAtom(SettingActiveKeyAtom);

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
        {!selectProviderItem?.apiKey || !selectProviderItem?.baseUrl ? (
          <div className="text-sm text-danger">
            AI处理需要AI API key，请先在
            <Link
              onClick={() => {
                setSettingModal(true);
                setActiveKey("ai");
              }}
              size="sm"
              underline="always"
              className="text-sm cursor-pointer"
            >
              设置
            </Link>
            中配置
          </div>
        ) : null}
        <Input
          size="sm"
          startContent={
            <div className="text-xs w-[80px] text-default-400">并发数</div>
          }
          className="w-[100px]"
          placeholder="并发数"
          type="number"
          value={concurrency.toString()}
          onChange={(e) => {
            handleConcurrencyChange(Number(e.target.value));
          }}
        />
        <Select
          startContent={
            <div className="text-xs w-[60px] text-default-400">提供商</div>
          }
          className="w-[180px]"
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
          startContent={
            <div className="text-xs w-[40px] text-default-400">模型</div>
          }
          selectedKeys={selectedModel ? [selectedModel] : undefined}
          placeholder="请选择模型"
          onSelectionChange={(keys) =>
            handleModelChange(Array.from(keys)[0] as string)
          }
        >
          {models?.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          )) ?? []}
        </Select>

        {processLoading ? (
          <Button
            onClick={() => {
              abortControllerRef.current?.forEach((controller) => {
                controller.abort();
              });
              isAbort.current = true;
            }}
            radius="sm"
            size="sm"
            color="primary"
          >
            停止
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                onAIProcess({
                  provider: selectedProvider,
                  model: selectModelItem?.name ?? "",
                  apiKey: selectProviderItem?.apiKey ?? "",
                  baseURL: selectProviderItem?.baseUrl ?? "",
                  concurrency: selectProviderItem?.concurrency ?? 30,
                })
              }
              radius="sm"
              isDisabled={
                !totalCount ||
                !selectProviderItem?.apiKey ||
                !selectProviderItem?.baseUrl ||
                !selectedModel
              }
              size="sm"
              isLoading={processLoading}
              color="primary"
            >
              一键AI处理
            </Button>
            <Tooltip
              radius="sm"
              content="AI处理需要AI API key，请先在设置中配置"
            >
              <div className="cursor-pointer">
                <MaterialSymbolsContactSupportOutline className="text-xl" />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleComponent;
