import React, { useState } from "react";
import { Tooltip } from "@nextui-org/react";
import { MaterialSymbolsHelpOutline } from "./icon";
import ExpandTreeMenu, { TreeNode } from "@/components/ExpandTreeMenu";
import Decimal from "decimal.js";
import { useLocalStorageState } from "ahooks";

interface AccountTreeMenuProps {
  items: TreeNode[];
  selectedKey?: string;
  onDelete: (key: string, type: string) => void;
  onEdit: (key: string, type: string) => void;
  onSelectionChange: (key: string | undefined) => void;
  netWorth: Decimal;
  month: Date[];
}

const AccountTreeMenu: React.FC<AccountTreeMenuProps> = ({
  items,
  selectedKey,
  onDelete,
  onEdit,
  onSelectionChange,
  netWorth,
  month,
}) => {
  const [openKeys, setOpenKeys] = useLocalStorageState<string[]>(
    "accountTreeOpenKeys",
    {
      defaultValue: [],
    }
  );
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between pl-6 pr-3 text-xs font-medium text-default-500 mb-2">
        <div className="">资产/负债</div>
        <div className=" pr-3 ">
          <Tooltip
            radius="sm"
            content={`截止${month[1].getFullYear()}/${
              month[1].getMonth() + 1
            }的净资产`}
          >
            <div className="flex items-center gap-1">
              <MaterialSymbolsHelpOutline />
              <div>净资产: {netWorth.toFixed(2)}</div>
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="px-4 pr-2">
        <ExpandTreeMenu
          data={items}
          selectedKey={selectedKey}
          onDelete={onDelete}
          openKeys={openKeys}
          onEdit={onEdit}
          onSelectionChange={onSelectionChange}
          onOpenChange={setOpenKeys}
        />
      </div>
    </div>
  );
};

export default AccountTreeMenu;
