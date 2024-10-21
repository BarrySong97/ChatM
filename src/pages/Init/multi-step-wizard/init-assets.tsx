import { useAssetsService } from "@/api/hooks/assets";
import AccountIconRender from "@/components/AccountIconRender";
import AccountModal from "@/components/AccountModal";
import { Asset } from "@db/schema";
import { Icon } from "@iconify/react";
import { Button, Chip } from "@nextui-org/react";
import React, { FC, useState } from "react";
export interface InitAssetsProps {}
const InitAssets: FC<InitAssetsProps> = () => {
  const { assets, deleteAsset } = useAssetsService();
  const [selectedAssets, setSelectedAssets] = useState<Asset>();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="max-auto">
      <div className="text-3xl font-bold leading-9  text-default-foreground">
        添加你的资产
      </div>
      <div className="py-2 text-medium text-default-500 mb-8">
        <p>你可以在这里添加你的资产</p>
        <p>如支付宝，微信，银行卡，固定资产等</p>
      </div>
      <div className="flex flex-wrap  gap-3 gap-y-4">
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
          size="sm"
          color="primary"
          className="rounded-2xl gap-0.5"
          endContent={
            <Icon
              icon="material-symbols-light:add-circle-rounded"
              className="text-lg "
            />
          }
          variant="flat"
        >
          新增资产
        </Button>
        {assets?.map((asset) => {
          return (
            <Button
              key={asset.name}
              onClick={() => {
                setSelectedAssets(asset);
                setIsOpen(true);
              }}
              startContent={<AccountIconRender icon={asset.icon || ""} />}
              size="sm"
              endContent={
                <Icon
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAsset(asset.id);
                  }}
                  icon="material-symbols-light:cancel"
                  className="text-lg "
                />
              }
              className="rounded-2xl gap-0.5"
              variant="flat"
            >
              {asset.name}
            </Button>
          );
        })}
      </div>
      <AccountModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        type="asset"
        data={selectedAssets}
      />
    </div>
  );
};

export default InitAssets;
