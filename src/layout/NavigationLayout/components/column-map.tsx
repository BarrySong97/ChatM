import React, { FC } from "react";
import { Form, Input } from "antd";
import { Input as NextUIInput, Select, SelectItem } from "@nextui-org/react";
export interface ColumnMapProps {
  column: Array<string>;
}
const ColumnMap: FC<ColumnMapProps> = ({ column }) => {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Form>
          <Form.Item name="transaction_date">
            <Select size="sm" radius="sm" placeholder="请选择">
              {column.map((item) => {
                return (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item name="type">
            <Select size="sm" radius="sm" placeholder="Select transaction date">
              {column.map((item) => {
                return (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item name="content">
            <Select
              selectionMode="multiple"
              size="sm"
              radius="sm"
              placeholder="Select type"
            >
              {column.map((item) => {
                return (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item name="source">
            <Select size="sm" radius="sm" placeholder="Select source">
              {column.map((item) => {
                return (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item name="remark">
            <Select size="sm" radius="sm" placeholder="Select remark">
              {column.map((item) => {
                return (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </div>
      <div className="flex-1">
        <Form>
          <Form.Item name="transaction_date">
            <NextUIInput
              size="sm"
              radius="sm"
              placeholder="交易日期"
              disabled
            />
          </Form.Item>

          <Form.Item name="type">
            <NextUIInput
              size="sm"
              radius="sm"
              placeholder="交易类型(收支/支出)"
              disabled
            />
          </Form.Item>

          <Form.Item name="content">
            <NextUIInput
              size="sm"
              radius="sm"
              placeholder="交易內容(可选多个自动组合)"
              disabled
            />
          </Form.Item>

          <Form.Item name="remark">
            <NextUIInput size="sm" radius="sm" placeholder="备注" disabled />
          </Form.Item>

          <Form.Item name="amount">
            <NextUIInput size="sm" radius="sm" placeholder="金额" disabled />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ColumnMap;
