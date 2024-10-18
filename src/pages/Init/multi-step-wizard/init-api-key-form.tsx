"use client";

import type { InputProps } from "@nextui-org/react";

import React, { useEffect, useState } from "react";
import { Input, Checkbox, Link, Chip } from "@nextui-org/react";

import { cn } from "./cn";
import { useProviderService } from "@/api/hooks/provider";
import { LLMIconMap } from "@/pages/Setting/components/ai/logos";
import { LLMProviderGetPlatformUrl } from "@/pages/Setting/components/ai/logos";
import { LLMProviderApiKeyGetUrl } from "@/pages/Setting/components/ai/logos";
import { Provider } from "@db/schema";
import { RadioGroup, Radio } from "@nextui-org/react";

type ProviderInfo = {
  apikeyUrl: string;
  platformUrl: string;
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
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
      }}
    >
      <div className="flex w-full items-center gap-3">
        <div className="item-center flex rounded-small p-2">{icon}</div>
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-3">
            <p className="text-small">{label}</p>
            {isRecommended && (
              <Chip
                className="h-6 p-0 text-tiny"
                color="success"
                variant="flat"
              >
                Recommended
              </Chip>
            )}
          </div>
        </div>
      </div>
    </Radio>
  );
};

function ProviderRadioGroup({
  providers,
  onChange,
}: {
  providers: ProviderInfo[];
  onChange: (value: string) => void;
}) {
  return (
    <RadioGroup
      defaultValue="DeepSeek"
      onValueChange={(value) => {
        onChange(value);
      }}
    >
      {providers.map((provider) => (
        <CustomRadio
          key={provider.name}
          value={provider.name}
          icon={provider.llmIcon}
        >
          {provider.name}
        </CustomRadio>
      ))}
    </RadioGroup>
  );
}
export type SignUpFormProps = React.HTMLAttributes<HTMLFormElement>;

const InitApiKey = React.forwardRef<HTMLFormElement, SignUpFormProps>(
  ({ className, ...props }, ref) => {
    const inputProps: Pick<InputProps, "labelPlacement" | "classNames"> = {
      labelPlacement: "outside",
      classNames: {
        label:
          "text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
      },
    };

    const { providers } = useProviderService();
    const getProviderInfo = (provider: Provider) => {
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
        apikeyUrl,
        apikey: provider.apiKey,
        platformUrl,
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
        setProvider(providersInfo[0]);
      }
    }, [providers]);
    useEffect(() => {
      if (providersInfo?.length) {
        setApiKey(provider?.apikey || "");
        setApiUrl(provider?.apikeyUrl || "");
      }
    }, [provider]);
    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          欢迎来到流记 👋
        </div>
        <div className="py-2 text-medium text-default-500 mb-8">
          <p>
            流记主要依靠AI大模型来帮助用户处理大量流水数据(同样可以手动添加)
          </p>
          <p>从而节省用户记账分类的时间</p>
        </div>
        <div className="flex  gap-8">
          <ProviderRadioGroup
            onChange={(value) => {
              setProvider(providersInfo?.find((p) => p.name === value) || null);
            }}
            providers={providersInfo || []}
          />
          <div className="space-y-4">
            <Input
              label="Api 地址"
              size="sm"
              variant="bordered"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <Input
              label="Api key"
              size="sm"
              variant="bordered"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
      </>
    );
  }
);

InitApiKey.displayName = "SignUpForm";

export default InitApiKey;
