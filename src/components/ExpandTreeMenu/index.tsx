import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ClassValue, clsx } from "clsx";
import { IcBaselineKeyboardArrowRight, IonMdMore } from "./icon";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@nextui-org/react";

export interface TreeNode {
  key: string;
  tooltip?: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  children?: TreeNode[];
  hasMore?: boolean;
  onTitleClick?: (key: string) => void;
}

interface TreeMenuProps {
  data: TreeNode[];
  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
  onDelete?: (key: string, type: string) => void;
  onEdit?: (key: string, type: string, data: any) => void;
  onOpenChange?: (keys: string[]) => void;
  openKeys?: string[];
}

interface TreeMenuItemProps {
  node: TreeNode;
  level: number;
  isSelected?: boolean;
  selectedKey?: string;
  onDelete?: (key: string, type: string) => void;
  onEdit?: (key: string, type: string, data: any) => void;
  onSelectionChange?: (key: string) => void;
  root?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}
const TreeMenuItem: React.FC<TreeMenuItemProps> = ({
  node,
  level,
  isSelected,
  selectedKey,
  onSelectionChange,
  onDelete,
  onEdit,
  root,
  isOpen,
  setIsOpen,
}) => {
  const [_isOpen, _setIsOpen] = useState(isOpen ?? false);
  const [isHovered, setIsHovered] = useState(false);
  if (node.key === "asset") {
    console.log(node.key, isOpen, _isOpen);
  }

  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = !hasChildren;
  const itemClassName = clsx(
    "flex items-center py-1 px-4  cursor-pointer text-sm text-[#575859]",
    "w-full",
    "z-0 relative inline-flex items-center box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden",

    // Interaction states
    "tap-highlight-transparent outline-none",

    // Sizing and spacing
    "min-w-16 h-8 gap-0.5 rounded-small",

    // Typography
    "text-tiny text-default-foreground",

    // SVG child element
    "[&>svg]:max-w-[theme(spacing.8)]",

    // Transitions and animations
    "transition-transform-colors-opacity motion-reduce:transition-none",

    // Background and colors
    "hover:bg-default/40 text-default-foreground",

    // Group
    "group ",
    {
      "bg-default/40 rounded-md font-semibold ": isLeaf && isSelected,
    }
  );
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (isLeaf && !node.key.includes("new")) {
          onSelectionChange?.(node.key);
        } else {
          onSelectionChange?.("");
        }
        node.onTitleClick?.(node.key);
      }}
    >
      <div
        className={itemClassName}
        style={{ paddingLeft: `calc(${level * 16}px + 0.5rem)` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasChildren && (
          <motion.div
            initial={false}
            className="w-4.5 h-4.5 text-lg flex  items-center justify-center rounded-md  hover:bg-default/100 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                setIsOpen ? setIsOpen(!isOpen) : _setIsOpen(!_isOpen);
              }
            }}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <IcBaselineKeyboardArrowRight />
          </motion.div>
        )}
        {hasChildren ? (
          <Tooltip
            delay={300}
            radius="sm"
            content={node.tooltip}
            placement="right"
          >
            <div className="ml-1 flex items-center gap-1 flex-1">
              {node.icon ? (
                <div
                  className="text-[18px]"
                  style={{
                    paddingLeft: isLeaf ? "0.5rem" : "0",
                  }}
                >
                  {node.icon}
                </div>
              ) : null}
              <div
                className="flex-1"
                onClick={(e) => {
                  node.onTitleClick?.(node.key);
                }}
                style={{
                  paddingLeft: isLeaf && !node.icon ? "1.8rem" : "0",
                }}
              >
                {node.label}
              </div>
            </div>
          </Tooltip>
        ) : (
          <div className="ml-1 flex items-center gap-1 flex-1">
            {node.icon ? (
              <div
                className="text-[18px]"
                style={{
                  paddingLeft: isLeaf ? "0.5rem" : "0",
                }}
              >
                {node.icon}
              </div>
            ) : null}
            <div
              className="flex-1"
              onClick={(e) => {
                node.onTitleClick?.(node.key);
              }}
              style={{
                paddingLeft: isLeaf && !node.icon ? "1.8rem" : "0",
              }}
            >
              {node.label}
            </div>
          </div>
        )}

        {isLeaf && node.hasMore !== false ? (
          <AnimatePresence>
            {isHovered ? (
              <>
                <motion.div
                  className="absolute text-lg right-[0px] ml-auto w-4.5 h-4.5 flex items-center justify-center rounded-md hover:bg-default/100 transition-colors duration-200 "
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Dropdown>
                    <DropdownTrigger>
                      <div>
                        <IonMdMore />
                      </div>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        onClick={() => onEdit?.(node.key, root ?? "", node)}
                        key="edit"
                      >
                        编辑
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => onDelete?.(node.key, root ?? "")}
                        className="text-danger"
                        color="danger"
                        key="delete"
                      >
                        删除
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {hasChildren && (isOpen ?? _isOpen) ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {node.children!.map((child) => (
              <TreeMenuItem
                key={child.key}
                node={child}
                level={level + 1}
                root={node.key}
                onDelete={onDelete}
                onEdit={onEdit}
                isSelected={selectedKey === child.key}
                selectedKey={selectedKey}
                onSelectionChange={onSelectionChange}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const ExpandTreeMenu: React.FC<TreeMenuProps> = ({
  data,
  selectedKey,
  onSelectionChange,
  onDelete,
  onEdit,
  onOpenChange,
  openKeys,
}) => {
  return (
    <div className=" overflow-hidden space-y-0.5">
      {data.map((node) => {
        if (node.key === "asset") {
          console.log(openKeys?.includes(node.key));
        }
        return (
          <TreeMenuItem
            key={node.key}
            onSelectionChange={onSelectionChange}
            node={node}
            onDelete={onDelete}
            onEdit={onEdit}
            selectedKey={selectedKey}
            level={0}
            isSelected={selectedKey === node.key}
            isOpen={openKeys?.includes(node.key)}
            setIsOpen={(isOpen) => {
              if (isOpen) {
                onOpenChange?.(openKeys ? [...openKeys, node.key] : [node.key]);
              } else {
                onOpenChange?.(
                  openKeys?.filter((key) => key !== node.key) ?? []
                );
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default ExpandTreeMenu;
