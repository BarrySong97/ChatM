import React, { ReactNode, useState } from "react";
import { Button, Menu, MenuProps } from "antd";
import { Tree } from "@douyinfe/semi-ui";

import { useLocation, useNavigate } from "react-router-dom";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { cn } from "@/lib/utils";

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedKeys = [pathname];
  const [selectKey, setSelectKey] = useState<string>("-1");
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";
  const [currentOptions, setCurrentOptions] = useState<string>();
  const getLabel = (
    label: string,
    icon: ReactNode,
    isFirstLevel: boolean,
    color?: string,
    showOptions?: boolean,
    value?: string
  ) => {
    return (
      <div className="flex py-2 pr-1 justify-between items-center account_item">
        <div className="flex gap-2 items-center">
          <div className="text-lg" style={{ color }}>
            {icon}
          </div>
          <div style={{ color: value === selectKey ? "#006FEE" : "" }}>
            {label}
          </div>
        </div>
        <div className="flex items-center &:hover:text-red-500">
          {showOptions ? <div style={{ color }}>2000</div> : null}
          {showOptions ? (
            <Dropdown
              onOpenChange={(value) => {
                if (!value) {
                  setCurrentOptions(undefined);
                }
              }}
            >
              <DropdownTrigger>
                <Button
                  className={label !== currentOptions ? "account_options" : ""}
                  size="small"
                  type="text"
                  onClick={() => setCurrentOptions(label)}
                  icon={<MoreOutlined />}
                />
              </DropdownTrigger>
              <DropdownMenu
                variant="faded"
                aria-label="Dropdown menu with description"
              >
                {isFirstLevel ? (
                  <DropdownItem
                    key="new"
                    description={`新${label}项`}
                    // startContent={<AddNoteIcon className={iconClasses} />}
                  >
                    New file
                  </DropdownItem>
                ) : (
                  <DropdownItem className="hidden" key="new"></DropdownItem>
                )}
                <DropdownItem
                  key="edit"
                  showDivider
                  description={`编辑${label}`}
                  //   startContent={<EditDocumentIcon className={iconClasses} />}
                >
                  Edit file
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  description={`删除${label}`}
                  //   startContent={
                  //     <DeleteDocumentIcon
                  //       className={cn(iconClasses, "text-danger")}
                  //     />
                  //   }
                >
                  Delete file
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : null}
        </div>
      </div>
    );
  };
  const treeData = [
    {
      label: "仪表盘",
      value: "dashboard",
      key: "-1",
      //   labelIcon: <SolarLayersBoldDuotone />,
      className: "rounded-md",
      level: -1,
      color: "#006FEE",
    },
    {
      label: "资产",
      value: "assets",
      //   labelIcon: <SolarChatRoundMoneyBold />,
      key: "0",
      className: "rounded-md",
      level: 0,
      color: "#17C964",
      children: [
        {
          label: "微信",
          color: "#17C964",
          value: "wechat",
          key: "0-1",
        },
      ],
    },
    {
      label: "收入",
      value: "income",
      //   labelIcon: <SolarReciveSquareBold />,
      color: "#F5A524",
      level: 0,
      key: "1",
    },
    {
      label: "消费",
      value: "expenses",
      //   labelIcon: <SolarSendSquareBold />,
      color: "#71717A",
      level: 0,
      key: "2",
    },
    {
      label: "负债",
      value: "liabilities",
      level: 0,
      //   labelIcon: <SolarSortBold />,
      color: "#F31260",
      key: "3",
    },
  ];
  return (
    <div className="w-full no-drag h-screen">
      <Tree
        defaultValue={selectKey}
        onChange={(value) => {
          setSelectKey(value as string);
        }}
        renderLabel={(_, treeNodeData) => {
          return getLabel(
            (treeNodeData?.label as string) ?? "",
            treeNodeData?.labelIcon ?? null,
            treeNodeData?.level === 0,
            treeNodeData?.color,
            treeNodeData?.level !== -1,
            treeNodeData?.value
          );
        }}
        treeData={treeData}
        defaultExpandAll
      />
    </div>
  );
};

export default SideBar;
