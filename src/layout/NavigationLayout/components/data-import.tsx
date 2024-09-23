import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
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
} from "./category-adpter";
import { message } from "antd";
import { TransactionService } from "@/api/services/TransactionService";
import to from "await-to-js";
import dayjs from "dayjs";
import Decimal from "decimal.js";
import { EditTransaction } from "@/api/hooks/transaction";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { useAtomValue } from "jotai";
import { BookAtom } from "@/globals";
import { useQueryClient } from "react-query";
import { ipcExportCsv, ipcOpenFolder } from "@/service/ipc";

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

  const handleFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const file = info.file.originFileObj as File;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      let results: Array<Array<string>> = [];

      const lines = csvData.split("\n");
      console.log(lines);

      results = lines.map((line) =>
        line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value) => value.trim())
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
            getTemplateData(templateData) as unknown as Transaction[]
          );
          break;
        case "wechat":
          const wechatData = results.slice(17);
          setPureData(wechatData);
          setFileData(getWechatData(wechatData) as unknown as Transaction[]);
          break;
      }
    };
    reader.readAsText(file);
  };

  const handleCategoryChange = (key: string) => {
    setFileSource(key);
    setSteps(1);
  };

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
              <ModalFooter className="justify-between">
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
                </div>
                <div className="flex gap-2">
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
