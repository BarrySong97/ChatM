import React from "react";
import { Pagination } from "@nextui-org/react";

interface BottomContentProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BottomContent: React.FC<BottomContentProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <Pagination
        showControls
        size="sm"
        classNames={{
          cursor: "bg-foreground text-background",
        }}
        color="default"
        page={page}
        total={totalPages}
        onChange={onPageChange}
      />
    </div>
  );
};

export default BottomContent;
