import React, { useState, useEffect, useRef } from "react";
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
import Papa from "papaparse";

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
    Papa.parse(file, {
      encoding: fileSource === "alipay" ? "GBK" : "UTF-8",
      complete: (results) => {
        setSteps(2);
        switch (fileSource) {
          case "alipay":
            let lineData: string[] = results.data?.[24] as string[];
            let lineData2: string[] = lineData?.slice(12);
            const groupedData = [];
            for (let i = 0; i < lineData2.length; i += 12) {
              const group = lineData2.slice(i, i + 12);
              if (group.length === 12) {
                groupedData.push(group);
              }
            }
            setPureData(groupedData);
            setFileData(getAlipayData(groupedData) as unknown as Transaction[]);
            break;
          case "template":
            const templateData = results.data?.slice(1) as Array<Array<string>>;
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
            const wechatData = results.data?.slice(17) as Array<Array<string>>;

            setPureData(wechatData);
            setFileData(getWechatData(wechatData) as unknown as Transaction[]);
            break;
          case "pixiu":
            const pixiuData = results.data?.slice(1) as Array<Array<string>>;
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
      },
      error: (error) => {
        console.error("Error parsing file:", error);
      },
    });
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
  const latestData = useRef<Array<Transaction & { status: boolean }>>([]);
  const [processLoading, setProcessLoading] = useState(false);
  const renderStep = () => {
    switch (steps) {
      case 0:
        return <InputCategoryList onChange={handleCategoryChange} />;
      case 1:
        return <FileUploader onFileChange={handleFileChange} />;
      case 2: // Changed from 3 to 2
        return (
          <ImportDataTable
            processLoading={processLoading}
            onProcessLoadingChange={setProcessLoading}
            onDataChange={setFileData}
            latestData={latestData}
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
      latestData.current = [];
    }
  }, [isOpen]);

  const isAllDataComplete = latestData.current?.every(
    (item) =>
      item.type &&
      item.destination_account_id &&
      item.source_account_id &&
      !["aborted", "loading"].includes(item.type) &&
      !["aborted", "loading"].includes(item.destination_account_id) &&
      !["aborted", "loading"].includes(item.source_account_id)
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
