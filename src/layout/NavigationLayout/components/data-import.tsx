import React, { useEffect, useState } from "react";
import PaperParse from "papaparse";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { InputCategoryList } from "./import-category";
import Dragger from "antd/es/upload/Dragger";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { set } from "lodash";
import ColumnMap from "./column-map";
import { Transaction } from "@db/schema";
import { getWechatData } from "./category-adpter";
import ImportDataTable from "./data-table";
import { TransactionService } from "@/api/services/TransactionService";
import to from "await-to-js";
import { EditTransaction } from "@/api/hooks/transaction";
import { message } from "antd";
import Decimal from "decimal.js";
import dayjs from "dayjs";
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
  const handleFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const file = info.file.originFileObj as File;
    setFile(file);
    PaperParse.parse(file, {
      complete(results) {
        setSteps(3);
        switch (fileSource) {
          case "alipay":
            const alipayData = results.data.slice(25) as Array<Array<string>>;

            // setFileData(getAlipayData(alipayData));
            break;
          case "wechat":
            const wechatData = results.data.slice(17) as Array<Array<string>>;
            setPureData(wechatData);
            setFileData(getWechatData(wechatData) as unknown as Transaction[]);
            break;
        }
      },
    });
  };
  const titles = ["选择数据来源", "文件上传", "匹配表头", `AI分类`, "导入数据"];

  const [steps, setSteps] = useState(0);
  const renderStep = () => {
    switch (steps) {
      case 0:
        return (
          <InputCategoryList
            onChange={(key) => {
              setFileSource(key);
              setSteps(1);
            }}
          />
        );

      case 1:
        return (
          <Dragger
            showUploadList={false}
            accept=".csv"
            multiple={false}
            onChange={handleFileChange}
          >
            <p className="ant-upload-text">点击或者拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">只支持csv文件</p>
          </Dragger>
        );
      //   case 2:
      //     return <ColumnMap data={dataColumn ?? []} />;
      case 3:
        return (
          <div>
            <ImportDataTable
              onDataChange={(data) => {
                setFileData(data);
              }}
              importSource={fileSource}
              data={fileData}
              pureData={pureData}
            />
          </div>
        );
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
  const [isComfirmModalOpen, setIsComfirmModalOpen] = useState(false);
  const isAllDataComplete = fileData.every(
    (item) => item.type && item.destination_account_id && item.source_account_id
  );
  const [importLoading, setImportLoading] = useState(false);
  return (
    <>
      <Modal
        size={steps === 3 ? "5xl" : "xl"}
        scrollBehavior="inside"
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
              <ModalFooter>
                <Button variant="flat" onPress={() => setSteps(steps - 1)}>
                  {steps > 0 ? "上一步" : "取消"}
                </Button>
                {steps === 0 || steps === 1 ? null : (
                  <Button
                    color="primary"
                    isDisabled={steps === 3 && !isAllDataComplete}
                    onPress={() => {
                      if (steps === 3) {
                        setIsComfirmModalOpen(true);
                      } else {
                        setSteps(steps + 1);
                      }
                    }}
                  >
                    {steps < 3 ? "下一步" : "导入"}
                  </Button>
                )}
              </ModalFooter>
              <Modal
                scrollBehavior="inside"
                isOpen={isComfirmModalOpen}
                onOpenChange={setIsComfirmModalOpen}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        {titles[steps]}
                      </ModalHeader>
                      <ModalBody>
                        <p>一共导入{fileData.length}条数据</p>
                      </ModalBody>
                      <ModalFooter>
                        <Button variant="flat" onPress={onClose}>
                          取消
                        </Button>
                        <Button
                          color="primary"
                          isLoading={importLoading}
                          onPress={async () => {
                            setImportLoading(true);
                            const [err, res] = await to(
                              TransactionService.createTransactions(
                                fileData?.map((v) => {
                                  return {
                                    ...v,
                                    transaction_date: dayjs(v.transaction_date)
                                      .toDate()
                                      .getTime(),
                                    amount: new Decimal(v.amount ?? 0)
                                      .mul(100)
                                      .toNumber(),
                                  };
                                }) as unknown as EditTransaction[]
                              )
                            );
                            if (err) {
                              console.error(err);
                              return;
                            } else {
                              onClose();
                              onOpenChange(false);
                              message.success("导入成功");
                            }
                            setImportLoading(false);
                          }}
                        >
                          确认导入
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DataImportModal;
