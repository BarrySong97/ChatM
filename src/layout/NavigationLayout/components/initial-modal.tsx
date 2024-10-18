import { useBookService } from "@/api/hooks/book";
import { BookService } from "@/api/services/BookService";
import { BookAtom } from "@/globals";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useAtomValue } from "jotai";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export interface InitialModalProps {}
const InitialModal: FC<InitialModalProps> = () => {
  const [isOpen, setIsOpen] = useState(true);
  const book = useAtomValue(BookAtom);
  useEffect(() => {
    if (!book?.isInitialized) {
      setIsOpen(true);
    }
  }, [book]);
  const navigate = useNavigate();
  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">初始化</ModalHeader>
            <ModalBody>
              <p>流记需要和你一起完成一些初始化内容</p>
              <p>只有初始化完成之后才能正常使用</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={async () => {
                  setIsOpen(false);
                  if (!book?.id) {
                    return;
                  }
                  await BookService.initBook(book.id);
                }}
              >
                我是老用户，跳过
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  navigate("/init");
                  onClose();
                }}
              >
                开始初始化
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InitialModal;
