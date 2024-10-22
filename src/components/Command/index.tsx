import React, { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import * as Popover from "@radix-ui/react-popover";
import "./index.css";
import { Command } from "cmdk";

import ElectronImage from "../Image";
import { Kbd, Modal, ModalContent } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { message } from "antd";
import {
  AccountModalTypeAtom,
  ShowAccountModalAtom,
  ShowCommandModalAtom,
  ShowDataImportModalAtom,
  ShowExportModalAtom,
  ShowSettingModalAtom,
  ShowTagEditModalAtom,
  ShowTransactionModalAtom,
} from "@/globals";
import { useAtom, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import TagEditModal from "../TagEditModal";

// Add this array outside of the component
const commandGroups = [
  {
    heading: "流水",
    items: [
      {
        icon: <Icon icon={"tabler:transaction-dollar"} />,
        command: (
          <>
            <Kbd className="min-w-4 text-xs">C</Kbd>
          </>
        ),
        value: "new_transaction",
        keywords: ["ct", "new", "transaction", "创建", "流水"],
        label: "流水创建",
      },
      {
        icon: <Icon icon={"flowbite:file-import-outline"} />,
        value: "import_transaction",
        command: (
          <>
            <Kbd className="min-w-4 text-xs">I</Kbd>
          </>
        ),
        keywords: ["it", "import", "transaction", "导入", "流水"],
        label: "流水导入",
      },
      {
        command: (
          <>
            <Kbd className="min-w-4 text-xs">E</Kbd>
          </>
        ),
        icon: <Icon icon={"flowbite:file-export-outline"} />,
        value: "export_transaction",
        keywords: ["et", "export", "transaction", "导出", "流水"],
        label: "流水导出",
      },
    ],
  },
  {
    heading: "创建账户",
    items: [
      {
        icon: <Icon icon={"material-symbols:account-balance-wallet"} />,
        value: "new_asset",
        keywords: ["new", "account", "asset", "创建", "资产"],
        label: "资产账户",
        command: <Kbd className="min-w-14 text-xs">Shift+A</Kbd>,
      },
      {
        icon: <Icon icon={"solar:card-bold-duotone"} />,
        value: "new_liability",
        keywords: ["new", "account", "liability", "创建", "负债"],
        label: "负债账户",
        command: <Kbd className="min-w-14 text-xs">Shift+L</Kbd>,
      },
      {
        icon: <Icon icon={"mdi:arrow-up-circle"} />,
        value: "new_income",
        keywords: ["new", "account", "income", "创建", "收入"],
        label: "收入账户",
        command: <Kbd className="min-w-14 text-xs">Shift+I</Kbd>,
      },
      {
        icon: <Icon icon={"mdi:arrow-down-circle"} />,
        value: "new_expense",
        keywords: ["new", "account", "expense", "创建", "支出"],
        label: "支出账户",
        command: <Kbd className="min-w-14 text-xs">Shift+E</Kbd>,
      },
    ],
  },
  {
    heading: "标签",
    items: [
      {
        icon: <Icon icon={"tabler:transaction-dollar"} />,
        command: <Kbd className="min-w-14 text-xs">Shift+T</Kbd>,
        value: "new_tag",
        keywords: ["ct", "new", "tag", "创建", "标签"],
        label: "标签创建",
      },
    ],
  },
  {
    heading: "跳转页面",
    items: [
      {
        icon: <Icon icon={"uim:graph-bar"} />,
        value: "page_home",
        keywords: ["page", "home", "图表"],
        label: "图表",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">H</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"tabler:transaction-dollar"} />,
        value: "page_transaction",
        keywords: ["page", "transaction", "流水"],
        label: "流水",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">R</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"material-symbols:calendar-month"} />,
        value: "page_calendar",
        keywords: ["page", "calendar", "日历"],
        label: "日历",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">C</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"material-symbols:book-4"} />,
        value: "page_book",
        keywords: ["page", "book", "账本"],
        label: "账本",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">B</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"material-symbols:calendar-month"} />,
        value: "page_tags",
        keywords: ["page", "tags", "标签"],
        label: "标签",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">C</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"tabler:settings"} />,
        value: "page_setting",
        keywords: ["page", "setting", "设置"],
        label: "设置",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">S</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"material-symbols:account-balance-wallet"} />,
        value: "page_asset",
        keywords: ["page", "asset", "资产"],
        label: "资产",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">A</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"solar:card-bold-duotone"} />,
        value: "page_liability",
        keywords: ["page", "liability", "负债"],
        label: "负债",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">L</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"mdi:arrow-up-circle"} />,
        value: "page_income",
        keywords: ["page", "income", "收入"],
        label: "收入",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">I</Kbd>
          </div>
        ),
      },
      {
        icon: <Icon icon={"mdi:arrow-down-circle"} />,
        value: "new_expense",
        keywords: ["new", "account", "expense", "创建", "支出"],
        label: "支出",
        command: (
          <div className="flex items-center">
            <Kbd className="min-w-4 text-xs">G</Kbd>
            <span className="mx-2 text-xs">后按</span>
            <Kbd className="min-w-4 text-xs">E</Kbd>
          </div>
        ),
      },
    ],
  },
];

export function RaycastCMDK() {
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    inputRef?.current?.focus();
  }, []);
  const [isOpen, setOpen] = useAtom(ShowCommandModalAtom);

  // Toggle the menu when ⌘K is pressed
  useHotkeys("meta+k, ctrl+k", (e) => {
    setOpen((open) => !open);
  });
  const setShowExportModal = useSetAtom(ShowExportModalAtom);
  const setShowTransactionModal = useSetAtom(ShowTransactionModalAtom);
  const setShowDataImportModal = useSetAtom(ShowDataImportModalAtom);
  const setShowAccountModal = useSetAtom(ShowAccountModalAtom);
  const setShowSettingModal = useSetAtom(ShowSettingModalAtom);
  const setShowTagEditModal = useSetAtom(ShowTagEditModalAtom);
  const setModalType = useSetAtom(AccountModalTypeAtom);
  const [isGPressed, setIsGPressed] = useState(false);
  const [isIPressed, setIsIPressed] = useState(false);
  const [isEPressed, setIsEPressed] = useState(false);
  useHotkeys("g+h", () => {
    navigate("/");
  });
  useHotkeys("g+t", () => {
    navigate("/transactions");
  });
  useHotkeys("g+c", () => {
    setIsGPressed(true);
    navigate("/calendar");
    setTimeout(() => {
      setIsGPressed(false);
    }, 0);
  });
  useHotkeys("g+r", () => {
    navigate("/tags");
  });
  useHotkeys("g+b", (e) => {
    navigate("/book");
  });
  useHotkeys("g+s", () => {
    setShowSettingModal(true);
  });
  useHotkeys("g+a", () => {
    navigate("/assets");
  });
  useHotkeys("g+l", () => {
    navigate("/liabilities");
  });
  useHotkeys("g+i", () => {
    setIsIPressed(true);
    navigate("/income");
    setTimeout(() => {
      setIsIPressed(false);
    }, 0);
  });
  useHotkeys("g+e", () => {
    setIsEPressed(true);
    navigate("/expense");
    setTimeout(() => {
      setIsEPressed(false);
    }, 0);
  });
  useHotkeys("e", (e) => {
    if (!isEPressed) {
      e.preventDefault();
      setShowExportModal(true);
    }
  });
  useHotkeys("c", (e, h) => {
    if (!isGPressed) {
      e.preventDefault();
      setShowTransactionModal(true);
    }
  });
  useHotkeys("i", (e) => {
    if (!isIPressed) {
      e.preventDefault();
      setShowDataImportModal(true);
    }
  });
  useHotkeys("shift+a", () => {
    setModalType("asset");
    setShowAccountModal(true);
  });
  useHotkeys("shift+l", () => {
    setModalType("liability");
    setShowAccountModal(true);
  });
  useHotkeys("shift+i", () => {
    setModalType("income");
    setShowAccountModal(true);
  });
  useHotkeys("shift+e", () => {
    setModalType("expense");
    setShowAccountModal(true);
  });
  useHotkeys("shift+t", () => {
    setShowTagEditModal(true);
  });
  const navigate = useNavigate();
  const onKeyDown = () => {
    setOpen(false);
    switch (value) {
      case "export_transaction":
        setShowExportModal(true);
        break;
      case "new_transaction":
        setShowTransactionModal(true);
        break;
      case "import_transaction":
        setShowDataImportModal(true);
        break;
      case "new_asset":
        setModalType("asset");
        setShowAccountModal(true);
        break;
      case "new_liability":
        setModalType("liability");
        setShowAccountModal(true);
        break;
      case "new_income":
        setModalType("income");
        setShowAccountModal(true);
        break;
      case "new_expense":
        setModalType("expense");
        setShowAccountModal(true);
        break;
      case "new_tag":
        setShowTagEditModal(true);
        break;
      case "page_home":
        navigate("/");
        break;
      case "page_transaction":
        navigate("/transactions");
        break;
      case "page_calendar":
        navigate("/calendar");
        break;
      case "page_book":
        message.info("敬请期待");
        // navigate("/book");
        break;
      case "page_setting":
        setShowSettingModal(true);
        break;
      case "page_tags":
        navigate("/tags");
        break;
      case "page_asset":
        navigate("/assets");
        break;
      case "page_liability":
        navigate("/liabilities");
        break;
      case "page_income":
        navigate("/income");
        break;
      case "page_expense":
        navigate("/expense");
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <Modal
        hideCloseButton
        className="raycast"
        isDismissable={false}
        backdrop="blur"
        classNames={{
          base: [
            "mt-[20vh]",
            "border-small",
            "dark:border-default-100",
            "supports-[backdrop-filter]:bg-background/80",
            "dark:supports-[backdrop-filter]:bg-background/30",
            "supports-[backdrop-filter]:backdrop-blur-md",
            "supports-[backdrop-filter]:backdrop-saturate-150",
          ],
        }}
        isOpen={isOpen}
        motionProps={{
          onAnimationComplete: () => {
            if (!isOpen) {
              //   setQuery("");
            }
          },
        }}
        placement="top"
        scrollBehavior="inside"
        size={"xl"}
        onClose={() => setOpen(false)}
      >
        <ModalContent>
          {(onClose) => (
            <Command value={value} onValueChange={(v) => setValue(v)}>
              <div cmdk-raycast-top-shine="" />
              <Command.Input
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onKeyDown();
                  }
                }}
                autoFocus
                placeholder="输入一个快捷命令或者搜索"
              />
              <hr cmdk-raycast-loader="" />
              <Command.List ref={listRef}>
                <Command.Empty>No results found.</Command.Empty>
                {commandGroups.map((group) => (
                  <Command.Group key={group.heading} heading={group.heading}>
                    {group.items.map((item) => (
                      <Item
                        key={item.value}
                        value={item.value}
                        keywords={item.keywords}
                        command={item.command}
                      >
                        {item.icon}
                        {item.label}
                      </Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              <div cmdk-raycast-footer="">
                <div className="flex-1">
                  <ElectronImage
                    src={"/icon-side.png"}
                    className="rounded-sm  h-4 w-4"
                    alt="logo"
                  />
                </div>
                <button cmdk-raycast-open-trigger="">
                  确认
                  <kbd>↵</kbd>
                </button>
              </div>
            </Command>
          )}
        </ModalContent>
      </Modal>
      <TagEditModal isInCommand />
    </div>
  );
}

function Item({
  children,
  value,
  keywords,
  command,
}: {
  children: React.ReactNode;
  value: string;
  keywords?: string[];
  command?: React.ReactNode;
}) {
  return (
    <Command.Item value={value} keywords={keywords} onSelect={() => {}}>
      {children}
      <div className="flex-1 flex justify-end ">{command}</div>
    </Command.Item>
  );
}

function SubCommand({
  inputRef,
  listRef,
  selectedValue,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  listRef: React.RefObject<HTMLElement>;
  selectedValue: string;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function listener(e: KeyboardEvent) {
      if (e.key === "k" && e.metaKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  React.useEffect(() => {
    const el = listRef.current;

    if (!el) return;

    if (open) {
      el.style.overflow = "hidden";
    } else {
      el.style.overflow = "";
    }
  }, [open, listRef]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal>
      <Popover.Trigger
        cmdk-raycast-subcommand-trigger=""
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        Actions
        <kbd>⌘</kbd>
        <kbd>K</kbd>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        align="end"
        className="raycast-submenu"
        sideOffset={16}
        alignOffset={0}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          inputRef?.current?.focus();
        }}
      >
        <Command>
          <Command.List>
            <Command.Group heading={selectedValue}>
              <SubItem shortcut="↵">
                <WindowIcon />
                Open Application
              </SubItem>
              <SubItem shortcut="⌘ ↵">
                <FinderIcon />
                Show in Finder
              </SubItem>
              <SubItem shortcut="⌘ I">
                <FinderIcon />
                Show Info in Finder
              </SubItem>
              <SubItem shortcut="⌘ ⇧ F">
                <StarIcon />
                Add to Favorites
              </SubItem>
            </Command.Group>
          </Command.List>
          <Command.Input placeholder="Search for actions..." />
        </Command>
      </Popover.Content>
    </Popover.Root>
  );
}

function SubItem({
  children,
  shortcut,
}: {
  children: React.ReactNode;
  shortcut: string;
}) {
  return (
    <Command.Item>
      {children}
      <div cmdk-raycast-submenu-shortcuts="">
        {shortcut.split(" ").map((key) => {
          return <kbd key={key}>{key}</kbd>;
        })}
      </div>
    </Command.Item>
  );
}

function TerminalIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}

function RaycastLightIcon() {
  return (
    <svg
      width="1024"
      height="1024"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M934.302 511.971L890.259 556.017L723.156 388.902V300.754L934.302 511.971ZM511.897 89.5373L467.854 133.583L634.957 300.698H723.099L511.897 89.5373ZM417.334 184.275L373.235 228.377L445.776 300.923H533.918L417.334 184.275ZM723.099 490.061V578.209L795.641 650.755L839.74 606.652L723.099 490.061ZM697.868 653.965L723.099 628.732H395.313V300.754L370.081 325.987L322.772 278.675L278.56 322.833L325.869 370.146L300.638 395.379V446.071L228.097 373.525L183.997 417.627L300.638 534.275V634.871L133.59 467.925L89.4912 512.027L511.897 934.461L555.996 890.359L388.892 723.244H489.875L606.516 839.892L650.615 795.79L578.074 723.244H628.762L653.994 698.011L701.303 745.323L745.402 701.221L697.868 653.965Z"
        fill="#FF6363"
      />
    </svg>
  );
}

function RaycastDarkIcon() {
  return (
    <svg
      width="1024"
      height="1024"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M301.144 634.799V722.856L90 511.712L134.244 467.804L301.144 634.799ZM389.201 722.856H301.144L512.288 934L556.34 889.996L389.201 722.856ZM889.996 555.956L934 511.904L512.096 90L468.092 134.052L634.799 300.952H534.026L417.657 184.679L373.605 228.683L446.065 301.144H395.631V628.561H723.048V577.934L795.509 650.395L839.561 606.391L723.048 489.878V389.105L889.996 555.956ZM323.17 278.926L279.166 322.978L326.385 370.198L370.39 326.145L323.17 278.926ZM697.855 653.61L653.994 697.615L701.214 744.834L745.218 700.782L697.855 653.61ZM228.731 373.413L184.679 417.465L301.144 533.93V445.826L228.731 373.413ZM578.174 722.856H490.07L606.535 839.321L650.587 795.269L578.174 722.856Z"
        fill="#FF6363"
      />
    </svg>
  );
}

function WindowIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.25 4.75V3.75C14.25 2.64543 13.3546 1.75 12.25 1.75H3.75C2.64543 1.75 1.75 2.64543 1.75 3.75V4.75M14.25 4.75V12.25C14.25 13.3546 13.3546 14.25 12.25 14.25H3.75C2.64543 14.25 1.75 13.3546 1.75 12.25V4.75M14.25 4.75H1.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FinderIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 4.75V6.25M11 4.75V6.25M8.75 1.75H3.75C2.64543 1.75 1.75 2.64543 1.75 3.75V12.25C1.75 13.3546 2.64543 14.25 3.75 14.25H8.75M8.75 1.75H12.25C13.3546 1.75 14.25 2.64543 14.25 3.75V12.25C14.25 13.3546 13.3546 14.25 12.25 14.25H8.75M8.75 1.75L7.08831 7.1505C6.9202 7.69686 7.32873 8.25 7.90037 8.25C8.36961 8.25 8.75 8.63039 8.75 9.09963V14.25M5 10.3203C5 10.3203 5.95605 11.25 8 11.25C10.0439 11.25 11 10.3203 11 10.3203"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.43376 2.17103C7.60585 1.60966 8.39415 1.60966 8.56624 2.17103L9.61978 5.60769C9.69652 5.85802 9.92611 6.02873 10.186 6.02873H13.6562C14.2231 6.02873 14.4665 6.75397 14.016 7.10088L11.1582 9.3015C10.9608 9.45349 10.8784 9.71341 10.9518 9.95262L12.0311 13.4735C12.2015 14.0292 11.5636 14.4777 11.1051 14.1246L8.35978 12.0106C8.14737 11.847 7.85263 11.847 7.64022 12.0106L4.89491 14.1246C4.43638 14.4777 3.79852 14.0292 3.96889 13.4735L5.04824 9.95262C5.12157 9.71341 5.03915 9.45349 4.84178 9.3015L1.98404 7.10088C1.53355 6.75397 1.77692 6.02873 2.34382 6.02873H5.81398C6.07389 6.02873 6.30348 5.85802 6.38022 5.60769L7.43376 2.17103Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <div cmdk-raycast-clipboard-icon="">
      <svg
        width="32"
        height="32"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.07512 2.75H4.75C3.64543 2.75 2.75 3.64543 2.75 4.75V12.25C2.75 13.3546 3.64543 14.25 4.75 14.25H11.25C12.3546 14.25 13.25 13.3546 13.25 12.25V4.75C13.25 3.64543 12.3546 2.75 11.25 2.75H9.92488M9.88579 3.02472L9.5934 4.04809C9.39014 4.75952 8.73989 5.25 8 5.25V5.25C7.26011 5.25 6.60986 4.75952 6.4066 4.04809L6.11421 3.02472C5.93169 2.38591 6.41135 1.75 7.07573 1.75H8.92427C9.58865 1.75 10.0683 2.3859 9.88579 3.02472Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function HammerIcon() {
  return (
    <div cmdk-raycast-hammer-icon="">
      <svg
        width="32"
        height="32"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.73762 6.19288L2.0488 11.2217C1.6504 11.649 1.6504 12.3418 2.0488 12.769L3.13083 13.9295C3.52923 14.3568 4.17515 14.3568 4.57355 13.9295L9.26238 8.90071M6.73762 6.19288L7.0983 5.80605C7.4967 5.37877 7.4967 4.686 7.0983 4.25872L6.01627 3.09822L6.37694 2.71139C7.57213 1.42954 9.50991 1.42954 10.7051 2.71139L13.9512 6.19288C14.3496 6.62017 14.3496 7.31293 13.9512 7.74021L12.8692 8.90071C12.4708 9.328 11.8248 9.328 11.4265 8.90071L11.0658 8.51388C10.6674 8.0866 10.0215 8.0866 9.62306 8.51388L9.26238 8.90071M6.73762 6.19288L9.26238 8.90071"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
