import React from "react";
import { Button } from "@nextui-org/react";

interface SideActionsProps {
  loading: boolean;
  onExport: () => void;
  onImport: () => void;
}

const SideActions: React.FC<SideActionsProps> = ({
  loading,
  onExport,
  onImport,
}) => {
  return (
    <div className="flex flex-col mx-4 gap-2">
      <Button
        size="sm"
        radius="sm"
        isLoading={loading}
        color="default"
        variant="flat"
        onClick={onExport}
      >
        导出流水数据
      </Button>
      <Button
        size="sm"
        radius="sm"
        variant="shadow"
        color="primary"
        onClick={onImport}
      >
        导入CSV文件
      </Button>
    </div>
  );
};

export default SideActions;
