import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
} from "@nextui-org/react";
import { InputCategoryList } from "./import-category";
import FileUploader from "./FileUploader";
import ImportDataTable from "./data-table";
import ConfirmImportModal from "./ConfirmImportModal";
import { Transaction } from "@db/schema";
import {
  getWechatData,
  getAlipayData,
  getTemplateData,
  getPixiuData,
} from "./category-adpter";
import { message } from "antd";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { ipcExportCsv, ipcOpenFolder } from "@/service/ipc";
import { useLocalStorageState } from "ahooks";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";

interface DataImportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Transaction[]>([]);
  const [dataColumn, setdataColumn] = useState<Array<string>>([]);
  const [fileSource, setFileSource] = useState<string>("");
  const [pureData, setPureData] = useState<Array<Array<string>>>([]);
  const [steps, setSteps] = useState(0);
  const [isComfirmModalOpen, setIsComfirmModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const titles = ["选择数据来源", "文件上传", "AI分类", "导入数据"];

  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const handleFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const file = info.file.originFileObj as File;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      let results: Array<Array<string>> = [];

      const lines = csvData.split("\n");

      // 这个正则表达式用于分割CSV文件的行，同时处理引号内的逗号和分号
      // 解释如下：
      // 1. ,(?=(?:(?:[^"]*"){2})*[^"]*$) 匹配逗号，但不匹配引号内的逗号
      //    - (?=...) 是正向预查，确保后面的模式匹配，但不消耗字符
      //    - (?:[^"]*"){2} 匹配偶数个引号之间的内容（包括引号）
      //    - (?:...)*[^"]*$ 确保从当前位置到行尾有偶数个引号
      // 2. |;(?=(?:(?:[^"]*"){2})*[^"]*$) 对分号进行相同的处理
      // 3. 然后对每个分割后的值进行trim()和去除首尾引号的处理
      // 分割CSV行的正则表达式
      // 这个正则表达式能够处理以下情况：
      // 1. 标准的逗号分隔
      // 2. 分号分隔（某些地区使用）
      // 3. 引号内的逗号和分号（不会被当作分隔符）
      // 4. 连续的逗号或分号（会创建空字段）
      // 5. 行末的逗号或分号（会创建一个额外的空字段）
      //
      // 注意：这个方法可能在处理非常大的文件时性能较低
      // 对于大文件，考虑使用流式解析或专门的CSV解析库
      const csvSplitRegex =
        /,(?=(?:(?:[^"]*"){2})*[^"]*$)|;(?=(?:(?:[^"]*"){2})*[^"]*$)/;

      // 处理每一行
      results = lines.map((line) => {
        // 分割行并处理每个字段
        return line.split(csvSplitRegex).map((value) => {
          // 去除首尾空白字符
          value = value.trim();
          // 如果字段被引号包围，去除引号
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          // 处理双引号转义（两个连续的双引号表示一个实际的双引号）
          value = value.replace(/""/g, '"');
          return value;
        });
      });

      // 移除可能的空行（例如文件末尾的空行）
      results = results.filter((row) => row.some((cell) => cell.length > 0));
      results = lines.map((line) =>
        line
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)|;(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((value) => value.trim().replace(/^"|"$/g, ""))
      );

      setSteps(2);
      switch (fileSource) {
        case "alipay":
          const alipayData = results.slice(25);
          setPureData(alipayData);
          setFileData(getAlipayData(alipayData) as unknown as Transaction[]);
          break;
        case "template":
          const templateData = results.slice(1);
          setPureData(templateData);
          setFileData(
            getTemplateData(
              templateData,
              incomes,
              assets,
              expenses,
              liabilities
            ) as unknown as Transaction[]
          );
          break;
        case "wechat":
          const wechatData = results.slice(17);
          setPureData(wechatData);
          setFileData(getWechatData(wechatData) as unknown as Transaction[]);
          break;
        case "pixiu":
          const pixiuData = results.slice(1);

          setPureData(pixiuData);

          setFileData(
            getPixiuData(
              pixiuData,
              incomes,
              assets,
              expenses
            ) as unknown as Transaction[]
          );
          break;
      }
    };
    if (fileSource === "alipay") {
      reader.readAsText(file, "GBK");
    } else {
      reader.readAsText(file);
    }
  };

  const handleCategoryChange = (key: string) => {
    setFileSource(key);
    setSteps(1);
  };

  const [isContentWrap, setIsContentWrap] = useLocalStorageState(
    "isContentWrap",
    {
      defaultValue: true,
    }
  );
  const renderStep = () => {
    switch (steps) {
      case 0:
        return <InputCategoryList onChange={handleCategoryChange} />;
      case 1:
        return <FileUploader onFileChange={handleFileChange} />;
      case 2: // Changed from 3 to 2
        return (
          <ImportDataTable
            onDataChange={setFileData}
            isContentWrap={isContentWrap ?? true}
            importSource={fileSource}
            data={fileData}
            pureData={pureData}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSteps(0);
      setFile(null);
      setFileData([]);
      setFileSource("");
    }
  }, [isOpen]);

  const isAllDataComplete = fileData?.every(
    (item) => item.type && item.destination_account_id && item.source_account_id
  );

  const [daownLoading, setDaownLoading] = useState(false);
  return (
    <>
      <Modal
        size={steps == 2 ? "5xl" : "xl"} // Changed from 3 to 2
        scrollBehavior="inside"
        className={steps == 2 ? "max-w-[1400px]" : ""}
        isKeyboardDismissDisabled={steps === 2}
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {titles[steps]}
              </ModalHeader>
              <ModalBody>{renderStep()}</ModalBody>
              <ModalFooter className="justify-between items-center">
                <div>
                  {steps == 0 ? (
                    <Button
                      onClick={async () => {
                        const res = await ipcOpenFolder();
                        if (res) {
                          const headers = [
                            "日期",
                            "描述",
                            "金额",
                            "类型",
                            "来源账户",
                            "目标账户",
                            "标签",
                            "备注",
                          ];
                          const csvData = headers.join(",");
                          const filePath = `${res}/流记模板.csv`;
                          setDaownLoading(true);
                          await ipcExportCsv(filePath, csvData);
                          message.success("下载成功");
                        }
                        setDaownLoading(false);
                      }}
                      isLoading={daownLoading}
                      variant="shadow"
                      color="primary"
                    >
                      下载模板文件
                    </Button>
                  ) : null}
                  {steps === 2 ? (
                    <Switch
                      defaultSelected={isContentWrap}
                      isSelected={isContentWrap}
                      aria-label="Automatic updates"
                      onValueChange={(e) => {
                        setIsContentWrap(e);
                      }}
                    >
                      交易内容是否换行
                    </Switch>
                  ) : null}
                </div>
                <div className="flex gap-2 items-center">
                  {steps === 2 && !isAllDataComplete ? (
                    <div className="text-sm text-danger">
                      每一条数据必须设置类型，来源账户，去向账户才能够导入
                    </div>
                  ) : null}
                  {steps > 0 ? (
                    <Button
                      color="secondary"
                      variant="flat"
                      onPress={() => setSteps(0)}
                    >
                      重新选择数据源
                    </Button>
                  ) : null}
                  <Button
                    variant="flat"
                    onPress={() => {
                      if (steps > 0) {
                        setSteps(steps - 1);
                      } else {
                        onClose();
                      }
                    }}
                  >
                    {steps > 0 ? "上一步" : "取消"}
                  </Button>
                  {steps === 0 ? null : (
                    <Button
                      color="primary"
                      isDisabled={
                        (steps === 2 && !isAllDataComplete) ||
                        importLoading ||
                        !fileData.length
                      }
                      onPress={() => {
                        if (steps === 2) {
                          // Changed from 3 to 2
                          setIsComfirmModalOpen(true);
                        } else {
                          setSteps(steps + 1);
                        }
                      }}
                    >
                      {steps < 2 ? "下一步" : "导入"}
                    </Button>
                  )}
                </div>
              </ModalFooter>
              <ConfirmImportModal
                isOpen={isComfirmModalOpen}
                onOpenChange={setIsComfirmModalOpen}
                fileData={fileData}
                onClose={onClose}
              />
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DataImportModal;
