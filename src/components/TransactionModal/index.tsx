import React, { useState } from "react";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  DatePicker,
  Checkbox,
} from "@nextui-org/react";
import { Form } from "antd";
import TagInput from "../TagInput";
import to from "await-to-js";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useExpenseService } from "@/api/hooks/expense";
import { useIncomeService } from "@/api/hooks/income";
import { FinancialOperation } from "@/api/db/manager";
import { useTransactionService } from "@/api/hooks/transaction";
import Decimal from "decimal.js";
import AccountSelect from "../AccountSelect";
import { liability } from "@db/schema";
import { useQueryClient } from "react-query";
import {
  operationColors,
  operationTranslations,
} from "../Transactions/contant";

interface TransactionModalProps {
  isOpen: boolean;
  onChange: (value: boolean) => void;
}
export type TransactionModalForm = {
  date: ZonedDateTime;
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
  const { createTransaction, isCreateLoading } = useTransactionService();
  const [date, setDate] = useState(new Date());
  const [createMore, setCreateMore] = useState(false);
  const queryClient = useQueryClient();
  const onCreate = async (onClose?: () => void) => {
    const [err, values] = await to<TransactionModalForm, Error>(
      form.validateFields()
    );
    if (err) {
      return;
    }
    const transaction = {
      transaction_date: date.getTime(),
      content: values.content,
      amount: new Decimal(values.amount).mul(100).toString(),
      source_account_id: values.source,
      destination_account_id: values.destination,
      type: values.type,
      tags: values.tags,
      remark: values.remark,
    };

    await createTransaction({
      transaction,
    });
    queryClient.invalidateQueries({ refetchActive: true });
    onClose?.();
  };
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const { expenses } = useExpenseService();
  const { incomes } = useIncomeService();
  const type = Form.useWatch("type", form);
  const renderSource = () => {
    switch (type) {
      case FinancialOperation.RepayLoan:
        return ["assets", assets];
      case FinancialOperation.Income:
        return ["incomes", incomes];
      case FinancialOperation.Expenditure:
        return ["assets", assets];
      case FinancialOperation.Transfer:
        return ["assets", assets];
      case FinancialOperation.Borrow:
        return ["liabilities", liabilities];
      case FinancialOperation.LoanExpenditure:
        return ["liabilities", liabilities];
      case FinancialOperation.Refund:
        return ["expenses", expenses];
      default:
        return ["", null];
    }
  };
  const renderDestination = () => {
    switch (type) {
      case FinancialOperation.Income:
        return ["assets", assets];
      case FinancialOperation.Expenditure:
        return ["expenses", expenses];
      case FinancialOperation.Transfer:
        return ["assets", assets];
      case FinancialOperation.RepayLoan:
        return ["liabilities", liabilities];
      case FinancialOperation.Borrow:
        return ["assets", assets];
      case FinancialOperation.LoanExpenditure:
        return ["expenses", expenses];
      case FinancialOperation.Refund:
        return ["assets", assets];
      default:
        return ["", null];
    }
  };
  const source = renderSource();
  const destination = renderDestination();
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          form.resetFields();
        }
        onChange(v);
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              交易流水创建
            </ModalHeader>
            <ModalBody>
              <Form form={form} labelCol={{ span: 3 }}>
                <Form.Item name="date" label="日期">
                  <DatePicker
                    size="sm"
                    variant="flat"
                    aria-label="date"
                    onChange={(date) => {
                      setDate(date.toDate());
                    }}
                    showMonthAndYearPickers
                    defaultValue={parseAbsoluteToLocal(date.toISOString())}
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
                  name="type"
                  label="类型"
                  rules={[{ required: true, message: "请选择类型" }]}
                >
                  <Select
                    renderValue={(item) => {
                      const value = Array.from(item)[0]
                        .key as FinancialOperation;
                      const color = operationColors[value];
                      const text = operationTranslations[value];
                      return (
                        <div className="flex items-center gap-1 ">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: color,
                            }}
                          ></div>
                          <div>{text}</div>
                        </div>
                      );
                    }}
                    size="sm"
                    aria-label="type"
                  >
                    <SelectItem key={FinancialOperation.Income} value="1">
                      <div className="flex items-center gap-1 ">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              operationColors[FinancialOperation.Income],
                          }}
                        ></div>
                        <div>收入</div>
                      </div>
                    </SelectItem>
                    <SelectItem key={FinancialOperation.Expenditure} value="2">
                      <div className="flex items-center gap-1 ">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              operationColors[FinancialOperation.Expenditure],
                          }}
                        ></div>
                        <div>支出</div>
                      </div>
                    </SelectItem>
                    <SelectItem key={FinancialOperation.Transfer} value="3">
                      <div className="flex items-center gap-1 ">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              operationColors[FinancialOperation.Transfer],
                          }}
                        ></div>
                        <div>转账(个人账户之间流转)</div>
                      </div>
                    </SelectItem>
                    <SelectItem
                      key={FinancialOperation.LoanExpenditure}
                      value="4"
                    >
                      <div className="flex items-center gap-1 ">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              operationColors[
                                FinancialOperation.LoanExpenditure
                              ],
                          }}
                        ></div>
                        <div>贷款消费(白条，花呗，信用卡，房贷)</div>
                      </div>
                    </SelectItem>
                    <SelectItem key={FinancialOperation.RepayLoan} value="5">
                      <div className="flex items-center gap-1 ">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              operationColors[FinancialOperation.RepayLoan],
                          }}
                        ></div>
                        <div>还款</div>
                      </div>
                    </SelectItem>
                    <SelectItem key={FinancialOperation.Borrow} value="6">
                      <div className="flex items-center gap-1 ">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              operationColors[FinancialOperation.Borrow],
                          }}
                        ></div>
                        <div>借款</div>
                      </div>
                    </SelectItem>
                    <SelectItem key={FinancialOperation.Refund} value="7">
                      <div className="flex items-center gap-1 ">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              operationColors[FinancialOperation.Refund],
                          }}
                        ></div>
                        <div>退款</div>
                      </div>
                    </SelectItem>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="source"
                  label="来源"
                  rules={[
                    { required: true, message: "请选择来源(先选择类型)" },
                  ]}
                >
                  <AccountSelect
                    type={source[0] as any}
                    data={source[1] as any}
                  />
                </Form.Item>
                <Form.Item
                  name="destination"
                  label="流向"
                  rules={[
                    { required: true, message: "请选择流向(先选择类型)" },
                  ]}
                >
                  <AccountSelect
                    type={destination[0] as any}
                    data={destination[1] as any}
                  />
                </Form.Item>
                <Form.Item name="tags" label="标签">
                  <TagInput />
                </Form.Item>
                <Form.Item name="remark" label="备注">
                  <Input
                    aria-label="remark"
                    size="sm"
                    isClearable
                    placeholder="请输入备注"
                  />
                </Form.Item>
              </Form>
            </ModalBody>
            <ModalFooter className="justify-between">
              <Checkbox
                checked={createMore}
                onChange={(e) => setCreateMore(e.target.checked)}
              >
                创建更多
              </Checkbox>
              <Button
                color="primary"
                isLoading={isCreateLoading}
                onPress={async () => {
                  if (createMore) {
                    await onCreate();
                  } else {
                    await onCreate(onClose);
                  }
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
