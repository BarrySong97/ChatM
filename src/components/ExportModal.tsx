import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import dayjs from "dayjs";
import { getBrowserTimezone } from "@/lib/utils";
import { parseDate } from "@internationalized/date";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (startDate: Date, endDate: Date) => void;
  isLoading: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isLoading,
}) => {
  const [startDate, setStartDate] = useState<Date>(
    dayjs().startOf("month").toDate()
  );
  const [endDate, setEndDate] = useState<Date>(dayjs().endOf("month").toDate());

  const handleExport = () => {
    onExport(startDate, endDate);
  };

  const timezone = getBrowserTimezone();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">导出数据</ModalHeader>
        <ModalBody>
          <DatePicker
            label="开始日期"
            value={parseDate(dayjs(startDate).format("YYYY-MM-DD"))}
            showMonthAndYearPickers
            onChange={(date) =>
              setStartDate(dayjs(date.toDate(timezone)).toDate())
            }
          />
          <DatePicker
            label="结束日期"
            showMonthAndYearPickers
            value={parseDate(dayjs(endDate).format("YYYY-MM-DD"))}
            onChange={(date) =>
              setEndDate(dayjs(date.toDate(timezone)).toDate())
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button isLoading={isLoading} color="primary" onPress={handleExport}>
            导出
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
