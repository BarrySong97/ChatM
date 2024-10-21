import { useAssetsService } from "@/api/hooks/assets";
import { useBookService } from "@/api/hooks/book";
import { useUserService } from "@/api/hooks/user";
import { BookService } from "@/api/services/BookService";
import { UserService } from "@/api/services/user";
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
  const [isOpen, setIsOpen] = useState(false);
  const { user, editUser } = useUserService();
  useEffect(() => {
    if (user && user.isInitialized === 0) {
      setIsOpen(true);
    }
  }, [user]);
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
                  if (!user?.id) {
                    return;
                  }
                  await editUser({
                    userId: user.id,
                    userData: {
                      isInitialized: 1,
                    },
                  });
                  setIsOpen(false);
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
