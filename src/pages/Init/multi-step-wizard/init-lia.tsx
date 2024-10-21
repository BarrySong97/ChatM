import { useLiabilityService } from "@/api/hooks/liability";
import AccountIconRender from "@/components/AccountIconRender";
import AccountModal from "@/components/AccountModal";
import { Asset, assets, liability, Liability } from "@db/schema";
import { Icon } from "@iconify/react";
import { Button, Chip } from "@nextui-org/react";
import React, { FC, useState } from "react";
export interface InitAssetsProps {}
const InitLiability: FC<InitAssetsProps> = () => {
  const { liabilities, deleteLiability } = useLiabilityService();
  const [selectedLiabilities, setSelectedLiabilities] = useState<Liability>();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="max-auto">
      <div className="text-3xl font-bold leading-9  text-default-foreground">
        添加你的负债 💳
      </div>
      <div className="py-2 text-medium text-default-500 mb-8">
        <p>你可以在这里添加你的负债</p>
        <p>如花呗，借呗，白条，贷款，房贷，车贷等</p>
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
          新增负债
        </Button>
        {liabilities?.map((liability) => {
          return (
            <Button
              key={liability.name}
              onClick={() => {
                setSelectedLiabilities(liability);
                setIsOpen(true);
              }}
              startContent={<AccountIconRender icon={liability.icon || ""} />}
              size="sm"
              endContent={
                <Icon
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLiability(liability.id);
                  }}
                  icon="material-symbols-light:cancel"
                  className="text-lg "
                />
              }
              className="rounded-2xl gap-0.5"
              variant="flat"
            >
              {liability.name}
            </Button>
          );
        })}
      </div>
      <AccountModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        type="liability"
        data={selectedLiabilities}
      />
    </div>
  );
};

export default InitLiability;
