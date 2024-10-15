import { useBookService } from "@/api/hooks/book";
import { AppPathAtom, AvatarAtom, BookAtom } from "@/globals";
import {
  Button,
  Chip,
  cn,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@nextui-org/react";
import { useAtom } from "jotai";
import { FC, useState } from "react";
import BookModal from "@/components/BookModal";
import AccountIconRender from "@/components/AccountIconRender";
import { BookService } from "@/api/services/BookService";
import { useModal } from "@/components/GlobalConfirmModal";
import { book, Book } from "@db/schema";
import { message } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { IonMdMore } from "@/components/ExpandTreeMenu/icon";
import BookItem from "./BookItem"; // Add this import
import { useLocalStorageState, useRequest } from "ahooks";
import { LicenseService } from "@/api/services/LicenseService";
import { License } from "@/api/models/license";
import { ApiError } from "@/api/core/ApiError";
import { IPC_EVENT_KEYS } from "@/constant";
import { indexDB } from "@/lib/indexdb";
import { useLiveQuery } from "dexie-react-hooks";

export interface BookListProps {
  onClose: () => void;
  onShowBookModal: (book?: Book) => void;
}
const BookList: FC<BookListProps> = ({ onClose, onShowBookModal }) => {
  const { books, deleteBook } = useBookService();
  const [SelectedBook, setSelectedBook] = useAtom(BookAtom);
  const modal = useModal();
  const onDelete = (book: Book) => {
    modal.showModal({
      title: "删除",
      description:
        "确定删除吗？删除之后无法恢复，所有账本之下的全部数据都会删除",
      onCancel: () => {},
      onConfirm: () => {
        if (book?.isCurrent) {
          const defaultBook = books?.find((book) => book.isDefault === 1);
          if (defaultBook) {
            setSelectedBook(defaultBook);
          }
        }
        deleteBook(book.id);
      },
    });
  };

  const [appPath] = useAtom(AppPathAtom);
  const iconSrc = "/icon-side.png";
  const imageSrc = import.meta.env.DEV ? iconSrc : `${appPath}/dist/${iconSrc}`;
  const [licenseStatus] = useLocalStorageState<string>("license-status", {
    defaultValue: "",
  });
  const [license, setLicense] = useLocalStorageState<License | null>(
    "license",
    {
      defaultValue: null,
    }
  );
  const renderLicenseStatus = () => {
    if (!licenseStatus || !license) {
      return (
        <Chip
          size="sm"
          className="mt-1"
          color="primary"
          radius="sm"
          variant="flat"
        >
          普通用户
        </Chip>
      );
    }
    if (licenseStatus === "DISABLED") {
      return (
        <Chip
          size="sm"
          className="mt-1"
          color="danger"
          radius="sm"
          variant="flat"
        >
          已禁用
        </Chip>
      );
    }
    if (licenseStatus === "EXPIRED") {
      return (
        <Chip
          size="sm"
          className="mt-1"
          color="danger"
          radius="sm"
          variant="flat"
        >
          已过期
        </Chip>
      );
    }
    return (
      <Chip
        size="sm"
        className="mt-1"
        color="primary"
        radius="sm"
        variant="flat"
      >
        内测用户
      </Chip>
    );
  };
  const users = useLiveQuery(() => indexDB.users.toArray());
  const avatarSrc = users?.[0]?.avatar;
  return (
    <>
      <div className="w-[280px] py-2">
        <div
          className="inline-flex items-start justify-start gap-3 rounded-small outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 z-10 aria-expanded:scale-[0.97] aria-expanded:opacity-70 subpixel-antialiased cursor-pointer"
          data-slot="trigger"
          aria-haspopup="dialog"
          aria-expanded="false"
        >
          <div className="inline-flex items-center gap-0.5">
            <div
              className={cn(
                "shadow-lg   w-[40px] h-[40px] flex items-center justify-center  text-lg rounded-lg",
                "transition-colors transition-background-color duration-300"
              )}
            >
              {SelectedBook?.icon ? (
                <AccountIconRender icon={SelectedBook?.icon} />
              ) : (
                SelectedBook?.name?.[0]
              )}
            </div>
          </div>
        </div>
        <Divider className="my-2" />
        <Button
          color="danger"
          className="w-full"
          size="sm"
          radius="sm"
          onClick={() => {}}
        >
          删除账本
        </Button>
      </div>
    </>
  );
};

export default BookList;
