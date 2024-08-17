import React from "react";
import {
  parseZonedDateTime,
  parseAbsoluteToLocal,
} from "@internationalized/date";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  DatePicker,
} from "@nextui-org/react";
import { Form } from "antd";
import TagInput from "../TagInput";
import to from "await-to-js";

interface TransactionModalProps {
  isOpen: boolean;
  onChange: (value: boolean) => void;
}
export type TransactionModalForm = {
  date: Date;
  content: string;
  amount: number;
  source: string;
  destination: string;
  type: string;
  tags: string[];
  remark: string;
};

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onChange,
}) => {
  const [form] = Form.useForm();
  const onCreate = async () => {
    const [err, values] = await to(form.validateFields());
    if (err) {
      console.log(err);
    }
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              交易流水创建
            </ModalHeader>
            <ModalBody>
              <Form form={form} labelCol={{ span: 3 }}>
                <Form.Item
                  name="date"
                  label="日期"
                  rules={[{ required: true, message: "请选择日期" }]}
                >
                  <DatePicker
                    size="sm"
                    variant="flat"
                    aria-label="date"
                    showMonthAndYearPickers
                    defaultValue={parseAbsoluteToLocal("2021-11-07T07:45:00Z")}
                  />
                </Form.Item>
                <Form.Item
                  name="content"
                  label="内容"
                  rules={[{ required: true, message: "请输入内容" }]}
                >
                  <Input
                    aria-label="content"
                    size="sm"
                    placeholder="请输入交易内容"
                  />
                </Form.Item>
                <Form.Item
                  name="amount"
                  label="金额"
                  rules={[{ required: true, message: "请输入金额" }]}
                >
                  <Input
                    aria-label="amount"
                    size="sm"
                    type="number"
                    placeholder="请输入金额"
                  />
                </Form.Item>
                <Form.Item
                  name="source"
                  label="来源"
                  rules={[{ required: true, message: "请选择来源" }]}
                >
                  <Select
                    aria-label="source"
                    size="sm"
                    placeholder="请选择来源"
                  >
                    <SelectItem key="1" value="1">
                      支付宝
                    </SelectItem>
                    <SelectItem key="2" value="2">
                      微信
                    </SelectItem>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="destination"
                  label="流向"
                  rules={[{ required: true, message: "请选择流向" }]}
                >
                  <Select
                    aria-label="destination"
                    size="sm"
                    placeholder="请选择流向"
                  >
                    <SelectItem key="1" value="1">
                      支付宝
                    </SelectItem>
                    <SelectItem key="2" value="2">
                      微信
                    </SelectItem>
                  </Select>
                </Form.Item>
                <Form.Item name="type" label="类型">
                  <Input
                    aria-label="type"
                    size="sm"
                    placeholder="收入，支出，转账，还贷，借入，贷款消费(自动生成)"
                    disabled
                  />
                </Form.Item>
                <Form.Item name="tags" label="标签">
                  <TagInput placeholder="使用,分隔" />
                </Form.Item>
                <Form.Item name="remark" label="备注">
                  <Input
                    aria-label="remark"
                    size="sm"
                    placeholder="请输入备注"
                  />
                </Form.Item>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={async () => {
                  await onCreate();
                  //   onClose();
                }}
              >
                创建
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TransactionModal;
