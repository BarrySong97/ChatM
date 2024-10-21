"use client";

import type { InputProps } from "@nextui-org/react";

import React, { useEffect, useState } from "react";

import { cn } from "./cn";
import { useProviderService } from "@/api/hooks/provider";
import { LLMIconMap } from "@/pages/Setting/components/ai/logos";
import { LLMProviderGetPlatformUrl } from "@/pages/Setting/components/ai/logos";
import { LLMProviderApiKeyGetUrl } from "@/pages/Setting/components/ai/logos";
import { Provider } from "@db/schema";
import { RadioGroup, Radio } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import TextAnimate from "@/components/ui/text-animat";
import FloatingAtBottomAndCenteredBanner from "../floating-at-bottom-and-centered-banner/App";

type ProviderInfo = {
  apikeyUrl: string;
  platformUrl: string;
  baseUrl: string;
  id: string;
  isRecommended: boolean;
  isDefault: boolean;
  apikey: string;
  llmIcon: React.ReactNode;
  name: string;
};
export const CustomRadio = (props: any) => {
  const { children, icon, label, isRecommended, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0  bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse min-w-[270px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
      }}
    >
      {/* {isRecommended && (
        <Chip
          className="h-6 p-0  absolute -top-2 -right-16  text-tiny  "
          color="success"
          variant="flat"
        >
          推荐，综合价格和性能体验最好
        </Chip>
      )} */}
      <div className="flex w-full items-center gap-3">
        <div className="item-center flex rounded-small p-2">{icon}</div>
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-3">
            <p className="text-small">{label}</p>
          </div>
        </div>
      </div>
    </Radio>
  );
};

function ProviderRadioGroup({
  providers,
  onChange,
  value,
}: {
  providers: ProviderInfo[];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <RadioGroup
      defaultValue="DeepSeek"
      orientation="horizontal"
      value={value}
      classNames={{
        wrapper: cn("gap-0 justify-center"),
      }}
      onValueChange={(value) => {
        onChange(value);
      }}
    >
      {providers.map((provider) => (
        <CustomRadio
          key={provider.name}
          value={provider.name}
          isRecommended={provider.isRecommended}
          icon={provider.llmIcon}
        >
          {provider.name}
        </CustomRadio>
      ))}
    </RadioGroup>
  );
}
export type SignUpFormProps = React.HTMLAttributes<HTMLFormElement> & {
  onSkip: () => void;
};

const SelectLlm = React.forwardRef<HTMLFormElement, SignUpFormProps>(
  ({ className, onSkip, ...props }, ref) => {
    const inputProps: Pick<InputProps, "labelPlacement" | "classNames"> = {
      labelPlacement: "outside",
      classNames: {
        label:
          "text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
      },
    };

    const { providers, editProvider } = useProviderService();
    const getProviderInfo = (provider: Provider, index: number) => {
      const apikeyUrl =
        LLMProviderApiKeyGetUrl[
          provider.name as keyof typeof LLMProviderApiKeyGetUrl
        ];
      const platformUrl =
        LLMProviderGetPlatformUrl[
          provider.name as keyof typeof LLMProviderGetPlatformUrl
        ];
      const llmIcon = LLMIconMap[provider.name as keyof typeof LLMIconMap];
      return {
        id: provider.id,
        baseUrl: provider.baseUrl,
        apikeyUrl,
        apikey: provider.apiKey,
        platformUrl,
        isDefault: provider.is_default ?? false,
        isRecommended: index === 2,
        llmIcon,
        name: provider.name,
      } as ProviderInfo;
    };
    const providersInfo = providers
      ?.map(getProviderInfo)
      .sort((a, b) =>
        a.name === "DeepSeek" ? -1 : b.name === "DeepSeek" ? 1 : 0
      );
    const [provider, setProvider] = useState<ProviderInfo | null>();
    const [apiKey, setApiKey] = useState<string>();
    const [apiUrl, setApiUrl] = useState<string>();
    useEffect(() => {
      if (providersInfo?.length) {
        const defaultProvider = providersInfo.find((p) => p.isDefault);
        setProvider(defaultProvider || providersInfo[0]);
      }
    }, [providers]);
    useEffect(() => {
      if (providersInfo?.length) {
        setApiKey(provider?.apikey || "");
        setApiUrl(provider?.baseUrl || "");
      }
    }, [provider]);
    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          选择你的大模型 🤖
        </div>
        <div className="py-2 text-medium text-default-500 mb-8">
          <p>
            流记主要依靠AI大模型来帮助用户处理大量流水数据(同样可以手动添加)
          </p>
          <p>从而节省用户记账分类的时间</p>
        </div>
        <div className="flex justify-between  gap-8">
          <ProviderRadioGroup
            value={provider?.name || ""}
            onChange={(value) => {
              const selectedProvider = providersInfo?.find(
                (p) => p.name === value
              );
              setProvider(selectedProvider || null);
              if (selectedProvider?.id) {
                editProvider({
                  providerId: selectedProvider.id,
                  provider: { is_default: 1 },
                });
              }
            }}
            providers={providersInfo || []}
          />
          {/* <div className="flex-1 flex flex-col justify-start">
            <div className="flex justify-between items-center mb-2">
              <a
                target="_blank"
                href={provider?.platformUrl}
                className="flex items-center gap-2"
              >
                {provider?.llmIcon}
              </a>
              <Button
                as={Link}
                variant="light"
                color="primary"
                target="_blank"
                href={provider?.apikeyUrl}
                size="sm"
              >
                获取Api key
              </Button>
            </div>
            <div className="space-y-4 ">
              <Input
                label="Api 地址"
                size="sm"
                variant="bordered"
                placeholder="请输入Api 地址"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <Input
                label="Api key"
                size="sm"
                variant="bordered"
                placeholder="请输入Api key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="mt-2 flex justify-end">
              {provider?.isRecommended && (
                <Chip
                  className="h-6 p-0   text-tiny  "
                  color="success"
                  variant="flat"
                >
                  推荐，综合价格和性能体验最好
                </Chip>
              )}
            </div>
          </div> */}
        </div>
      </>
    );
  }
);

SelectLlm.displayName = "SignUpForm";

export default SelectLlm;
