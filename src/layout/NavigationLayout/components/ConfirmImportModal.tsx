import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Transaction } from "@db/schema";
import { TransactionService } from "@/api/services/TransactionService";
import to from "await-to-js";
import { EditTransaction } from "@/api/hooks/transaction";
import { message } from "antd";
import Decimal from "decimal.js";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import { BookAtom } from "@/globals";
import { useQueryClient } from "react-query";

interface ConfirmImportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fileData: Transaction[];
  onClose: () => void;
}

const ConfirmImportModal: React.FC<ConfirmImportModalProps> = ({
  isOpen,
  onOpenChange,
  fileData,
  onClose,
}) => {
  const [importLoading, setImportLoading] = useState(false);

  const book = useAtomValue(BookAtom);
  const queryClient = useQueryClient();
  const handleConfirmImport = async () => {
    setImportLoading(true);
    const [err, res] = await to(
      TransactionService.createTransactions(
        fileData?.map((v) => ({
          ...v,
          transaction_date: dayjs(v.transaction_date).toDate().getTime(),
          amount: new Decimal(v.amount ?? 0).mul(100).toNumber(),
          book_id: book?.id,
        })) as unknown as EditTransaction[]
      )
    );
    if (err) {
      console.error(err);
      message.error("导入失败");
    } else {
      onClose();
      message.success("导入成功");
    }
    queryClient.invalidateQueries({ refetchActive: true });
    setImportLoading(false);
  };

  return (
    <Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">确认导入</ModalHeader>
            <ModalBody>
              <p>一共导入{fileData.length}条数据</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                isLoading={importLoading}
                onPress={handleConfirmImport}
              >
                确认导入
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmImportModal;
