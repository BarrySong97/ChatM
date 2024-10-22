import React from "react";
import { Tooltip } from "@nextui-org/react";
import { MaterialSymbolsHelpOutline } from "./icon";
import ExpandTreeMenu, { TreeNode } from "@/components/ExpandTreeMenu";
import Decimal from "decimal.js";

interface IncomeExpenseTreeMenuProps {
  items: TreeNode[];
  selectedKey?: string;
  onDelete: (key: string, type: string) => void;
  onEdit: (key: string, type: string) => void;
  onSelectionChange: (key: string | undefined) => void;
  balance: Decimal;
  month: Date[];
}

const IncomeExpenseTreeMenu: React.FC<IncomeExpenseTreeMenuProps> = ({
  items,
  selectedKey,
  onDelete,
  onEdit,
  onSelectionChange,
  balance,
  month,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between pl-6 pr-3 text-xs font-medium text-default-500 mb-2">
        <div className="">支出/收入</div>
        <div className=" pr-3 ">
          <Tooltip
            radius="sm"
            content={`${month[0].getFullYear()}/${
              month[0].getMonth() + 1
            } - ${month[1].getFullYear()}/${month[1].getMonth() + 1}结余`}
          >
            <div className="flex items-center gap-1">
              <MaterialSymbolsHelpOutline />
              <div>结余: {balance.toFixed(2)}</div>
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="px-4 pr-2">
        <ExpandTreeMenu
          data={items}
          selectedKey={selectedKey}
          onDelete={onDelete}
          onEdit={onEdit}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
};

export default IncomeExpenseTreeMenu;
