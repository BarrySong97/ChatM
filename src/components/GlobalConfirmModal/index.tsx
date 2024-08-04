import React, { createContext, useContext, useState } from "react";
import ConfirmModal from "../ConfirmModal";

// 定义模态框内容的类型
interface ModalContent {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}

// 定义ModalContext的类型
interface ModalContextType {
  isModalOpen: boolean;
  showModal: (content: {
    title: string;
    description: string;
    onCancel: () => void;
    onConfirm: () => void;
  }) => void;
  modalContent: ModalContent;
}

// 创建一个带有类型的上下文对象
const ModalContext = createContext<ModalContextType | null>(null);

// ModalProvider组件
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: "Confirm Title",
    description: "Confirm Description",
    onCancel: () => {},
    onConfirm: () => {},
  });

  const showModal = (content: {
    title: string;
    description: string;
    onCancel: () => void;
    onConfirm: () => void;
  }) => {
    const { title, description, onCancel, onConfirm } = content;
    setModalContent({ title, description, onCancel, onConfirm });
    setIsModalOpen(true);
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, showModal, modalContent }}>
      {children}
      <ConfirmModal
        title={modalContent.title}
        description={modalContent.description}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCancel={modalContent.onCancel}
        onConfirm={modalContent.onConfirm}
      />
    </ModalContext.Provider>
  );
}

// Modal组件
// useModal hook
export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
