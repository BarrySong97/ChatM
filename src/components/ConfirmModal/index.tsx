import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React, { FC, ReactNode } from "react";
export interface ConfirmModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onOpenChange: (f: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}
const ConfirmModal: FC<ConfirmModalProps> = ({
  title,
  description,
  isOpen,
  onOpenChange,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 dark:text-foreground">
              {title}
            </ModalHeader>
            <ModalBody>
              <p className="dark:text-foreground">{description}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="flat"
                onPress={() => {
                  onClose();
                  onCancel?.();
                }}
              >
                取消
              </Button>
              <Button
                className="bg-black text-white"
                onPress={() => {
                  onClose();
                  onConfirm?.();
                }}
              >
                确认
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
