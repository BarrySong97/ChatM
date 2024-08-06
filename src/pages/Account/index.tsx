import { database } from "@/db";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import React, { FC, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import AccountCard from "./components/account-card";
import { accounts, type Account } from "../../../electron/db/schema";
import { set } from "lodash";
import to from "await-to-js";
import { createId } from "@paralleldrive/cuid2";
import { Alert, Form, notification } from "antd";
import { eq } from "drizzle-orm";
import PopoverConfirm from "@/components/PopoverConfirm";
import { CN_ACCOUNTS } from "@/constant";
export interface AccountProps {}
type FormType = {
  title: string;
};
const Account: FC<AccountProps> = () => {
  const { data } = useQuery("accounts", {
    queryFn: async () => {
      return database.query.accounts.findMany();
    },
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [focusAccount, setfocusAccount] = useState<Account>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isOpen) {
      setfocusAccount(undefined);
      form.resetFields();
    }
  }, [isOpen]);
  return (
    <div className="px-12 py-8 mt-6  mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">账户</h1>
        </div>
        <Button onClick={onOpen} size="sm" color="primary">
          添加
        </Button>
      </div>
      <Divider className="my-6" />
      <div className=" grid grid-cols-4 gap-8">
        {data?.map((account) => (
          <AccountCard
            key={account.id}
            data={account}
            onClick={() => {
              setfocusAccount(account);
              form.setFieldsValue(account);
              onOpen();
            }}
          />
        ))}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {focusAccount ? "编辑" : "添加"}账户
              </ModalHeader>
              <ModalBody>
                <Alert
                  message="可选择的账户可以自动匹配表格转化流程，如果自定义名称无法匹配只能自己手动匹配"
                  type="info"
                  closable
                />
                <Form form={form}>
                  <Form.Item
                    valuePropName="selectedKey"
                    trigger="onSelectionChange"
                    rules={[
                      {
                        required: true,
                        message: "请输入账户名称",
                      },
                    ]}
                    name="title"
                  >
                    <Autocomplete
                      allowsCustomValue
                      size="sm"
                      placeholder="请输入账户名称"
                      label="账户名称"
                    >
                      {CN_ACCOUNTS.map((v) => (
                        <AutocompleteItem key={v} value={v}>
                          {v}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </Form.Item>
                </Form>
              </ModalBody>
              <ModalFooter>
                {!focusAccount ? (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      onClose();
                    }}
                  >
                    关闭
                  </Button>
                ) : (
                  <PopoverConfirm
                    title="确认删除分类"
                    desc="删除改分类会导致关联的数据失去分类，可能会导致某些查询数据发生改变"
                    placement="bottom"
                    onOk={async () => {
                      const [err] = await to(
                        database
                          .delete(accounts)
                          .where(eq(accounts.id, focusAccount.id))
                          .execute()
                      );
                      if (!err) {
                        notification.open({
                          placement: "bottomRight",
                          style: {
                            height: 60,
                          },
                          type: "success",
                          message: "删除成功",
                        });
                        queryClient.invalidateQueries("accounts");
                        onClose();
                      }
                    }}
                    showArrow
                  >
                    <Button color="danger" variant={"flat"}>
                      删除
                    </Button>
                  </PopoverConfirm>
                )}
                <Button
                  color="primary"
                  onPress={async () => {
                    setLoading(true);
                    const [formErr, value] = await to<FormType, Error>(
                      form.validateFields()
                    );
                    if (formErr) return;
                    const [err] = await to(
                      focusAccount
                        ? database
                            .update(accounts)
                            .set({
                              title: value.title,
                              updated_at: new Date().getTime(),
                            })
                            .where(eq(accounts.id, focusAccount.id))
                            .execute()
                        : database.insert(accounts).values({
                            id: createId(),
                            title: value.title,
                            created_at: new Date().getTime(),
                            color: "#3876F6",
                            updated_at: new Date().getTime(),
                          })
                    );
                    if (!err) {
                      notification.open({
                        placement: "bottomRight",
                        style: {
                          height: 60,
                        },
                        type: "success",
                        message: focusAccount ? "编辑成功" : "创建成功",
                      });
                      queryClient.invalidateQueries("accounts");
                      onClose();
                    }

                    setLoading(false);
                  }}
                >
                  {focusAccount ? "编辑" : "添加"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Account;
