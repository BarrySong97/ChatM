import React from "react";
import { Button } from "@nextui-org/react";
import PopoverConfirm from "../../PopoverConfirm";

interface SelectedRowsActionsProps {
  selectedRows: any[];
  setSelectedRows: React.Dispatch<React.SetStateAction<any[]>>;
  deleteTransactions: (ids: string[]) => Promise<void>;
}

const SelectedRowsActions: React.FC<SelectedRowsActionsProps> = ({
  selectedRows,
  setSelectedRows,
  deleteTransactions,
}) => {
  return (
    <div
      className="fixed bottom-0 left-[310px] right-0 bg-background border-t rounded-b-lg border-divider shadow-lg transition-transform duration-300 ease-in-out transform translate-y-0"
      style={{
        transform:
          selectedRows.length > 0 ? "translateY(-10px)" : "translateY(100%)",
        opacity: selectedRows.length > 0 ? 1 : 0,
        transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
      }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-sm">
          已选择 <span className="font-bold">{selectedRows.length}</span> 项
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => setSelectedRows([])}
            variant="flat"
            size="sm"
            radius="sm"
          >
            取消选择
          </Button>
          <PopoverConfirm
            title="删除所选多个流水"
            desc="删除所选多个流水将无法恢复，请谨慎操作"
            onOk={async () => {
              await deleteTransactions(selectedRows.map((row) => row.id));

              return Promise.resolve();
            }}
          >
            <Button radius="sm" size="sm" color="danger">
              删除所选
            </Button>
          </PopoverConfirm>
        </div>
      </div>
    </div>
  );
};

export default SelectedRowsActions;
