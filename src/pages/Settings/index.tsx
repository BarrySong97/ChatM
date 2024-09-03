import ExpandTreeMenu, { TreeNode } from "@/components/ExpandTreeMenu";
import React, { FC, useState } from "react";
export interface SettingsProps {}
const Settings: FC<SettingsProps> = () => {
  const treeData: TreeNode[] = [
    {
      id: "1",
      label: "Getting Started",
      children: [
        { id: "1-1", label: "AFFINE - not just a note-taking ap" },
        { id: "1-2", label: "Templates Galleries" },
      ],
    },
    { id: "2", label: "素材库" },
    { id: "3", label: "未命名" },
    { id: "4", label: "22" },
  ];
  const [selectedKey, setSelectedKey] = useState<string>();

  // 在你的应用中使用
  return (
    <ExpandTreeMenu
      data={treeData}
      selectedKey={selectedKey}
      onSelectionChange={setSelectedKey}
    />
  );
};

export default Settings;
