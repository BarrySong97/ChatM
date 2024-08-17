import React from "react";
import {
  parseZonedDateTime,
  parseAbsoluteToLocal,
  ZonedDateTime,
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
  SelectSection,
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
import { Transaction } from "@db/schema";
import Decimal from "decimal.js";

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
  tags: string;
  remark: string;
};

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onChange,
}) => {
  const [form] = Form.useForm();
  const { createTransaction, isCreateLoading } = useTransactionService();
  const onCreate = async () => {
    const [err, values] = await to<TransactionModalForm, Error>(
      form.validateFields()
    );
    if (err) {
      console.log(err);
      return;
    }
    const transaction = {
      transaction_date: values.date ? values.date.millisecond : Date.now(),
      content: values.content,
      amount: new Decimal(values.amount).mul(100).toString(),
      source_account_id: values.source,
      destination_account_id: values.destination,
      type: values.type,
      tags: values.tags,
      remark: values.remark,
    };
    createTransaction({
      transaction,
    });
  };
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const { expenses } = useExpenseService();
  const { incomes } = useIncomeService();
  const type = Form.useWatch("type", form);
  const renderSource = () => {
    switch (type) {
      case FinancialOperation.RepayLoan:
        return (
          <SelectSection title="还款来源">
            {assets?.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.Income:
        return (
          <SelectSection title="收入来源">
            {incomes?.map((income) => (
              <SelectItem key={income.id} value={income.id}>
                {income.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.Expenditure:
        return (
          <SelectSection title="支出账户">
            {assets?.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.Transfer:
        return (
          <SelectSection title="转账账户">
            {assets?.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.Borrow:
        return (
          <SelectSection title="借入来源">
            {liabilities?.map((liability) => (
              <SelectItem key={liability.id} value={liability.id}>
                {liability.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.LoanExpenditure:
        return (
          <SelectSection title="贷款来源">
            {liabilities?.map((liability) => (
              <SelectItem key={liability.id} value={liability.id}>
                {liability.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      default:
        return null;
    }
  };
  const renderDestination = () => {
    switch (type) {
      case FinancialOperation.Income:
        return (
          <SelectSection title="收入账户">
            {assets?.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.Expenditure:
        return (
          <SelectSection title="支出类别">
            {expenses?.map((expense) => (
              <SelectItem key={expense.id} value={expense.id}>
                {expense.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.Transfer:
        return (
          <SelectSection title="转账收款账户">
            {assets?.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.RepayLoan:
        return (
          <SelectSection title="还款账户">
            {liabilities?.map((liability) => (
              <SelectItem key={liability.id} value={liability.id}>
                {liability.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.Borrow:
        return (
          <SelectSection title="目标资产">
            {assets?.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      case FinancialOperation.LoanExpenditure:
        return (
          <SelectSection title="支出类别">
            {expenses?.map((expense) => (
              <SelectItem key={expense.id} value={expense.id}>
                {expense.name}
              </SelectItem>
            )) ?? []}
          </SelectSection>
        );
      default:
        return null;
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
                  trigger="onChange"
                  valuePropName="value"
                >
                  <DatePicker
                    size="sm"
                    variant="flat"
                    aria-label="date"
                    onChange={(date) => {
                      form.setFieldValue("date", date);
                    }}
                    showMonthAndYearPickers
                    defaultValue={parseAbsoluteToLocal(
                      new Date().toISOString()
                    )}
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
                  <Select size="sm" aria-label="type">
                    <SelectItem key={FinancialOperation.Income} value="1">
                      收入
                    </SelectItem>
                    <SelectItem key={FinancialOperation.Expenditure} value="2">
                      支出
                    </SelectItem>
                    <SelectItem key={FinancialOperation.Transfer} value="3">
                      转账(个人账户之间流转)
                    </SelectItem>
                    <SelectItem
                      key={FinancialOperation.LoanExpenditure}
                      value="4"
                    >
                      贷款消费(白条，花呗，信用卡，房贷)
                    </SelectItem>
                    <SelectItem key={FinancialOperation.RepayLoan} value="5">
                      还款
                    </SelectItem>
                    <SelectItem key={FinancialOperation.Borrow} value="6">
                      借款
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
                  <Select
                    aria-label="source"
                    size="sm"
                    placeholder="请选择来源"
                  >
                    {renderSource() ?? []}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="destination"
                  label="流向"
                  rules={[
                    { required: true, message: "请选择流向(先选择类型)" },
                  ]}
                >
                  <Select
                    aria-label="destination"
                    size="sm"
                    placeholder="请选择流向"
                  >
                    {renderDestination() ?? []}
                  </Select>
                </Form.Item>
                <Form.Item name="tags" label="标签">
                  <TagInput />
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
                isLoading={isCreateLoading}
                onPress={async () => {
                  await onCreate();
                  onClose();
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
