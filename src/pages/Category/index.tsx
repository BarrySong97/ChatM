import to from "await-to-js";
import { createId } from "@paralleldrive/cuid2";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useAtom } from "jotai";
import { FC, useState } from "react";
import { Item, showPriceAtom } from "../Index/components/category";
import { useQuery, useQueryClient } from "react-query";
import { database } from "@/db";
import { type Category, category } from "../../../electron/db/schema";
import { MenuProps, notification } from "antd";
import { eq } from "drizzle-orm";
import PopoverConfirm from "@/components/PopoverConfirm";
export interface CategoryProps {}
const Category: FC<CategoryProps> = () => {
  const categoryList = [
    {
      title: "资产",
    },
    {
      title: "收入",
    },
    {
      title: "支出",
    },
    {
      title: "负债",
    },
  ];
  const { data } = useQuery("category", {
    queryFn: async () => {
      const accounts = await database.query.accounts.findMany();
      const res1 = (await database.select().from(category)).filter(
        (item) => item.type === 0
      );
      const res2 = (await database.select().from(category)).filter(
        (item) => item.type === 1
      );
      const res3 = (await database.select().from(category)).filter(
        (item) => item.type === 2
      );
      return [accounts, res1, res2, res3];
    },
  });
  const [showPrice, setShowPrice] = useAtom(showPriceAtom);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [focusCategory, setFocusCategory] = useState<Category>();
  const [focusType, setFocusType] = useState(0);
  const [value, setValue] = useState<Category>();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [contextMenuShow, setContextMenuShow] = useState(false);
  const menuItems: MenuProps["items"] = [
    {
      label: "删除",
      key: "1",
    },
  ];

  return (
    <div className="px-12 py-8 mt-6  mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">账户管理</h1>
        </div>
      </div>
      <Divider className="my-6" />
      <div className="flex gap-8 justify-between">
        {categoryList.map((item, categoryIndex) => {
          return (
            <Card radius="sm" shadow="sm" className="flex-1" key={item.title}>
              <CardHeader className="flex gap-3 justify-between">
                <div>{item.title} </div>
                <div
                  onClick={() => {
                    setShowPrice(!showPrice);
                  }}
                  className="text-xs select-none cursor-pointer text-gray-400 underline underline-offset-4"
                >
                  显示{showPrice ? "百分比" : "金额"}
                </div>
              </CardHeader>
              <CardBody>
                <Listbox
                  items={data?.[categoryIndex] ?? []}
                  variant="flat"
                  aria-label="Dynamic Actions"
                >
                  {(item) => (
                    <ListboxItem
                      onClick={() => {
                        setFocusCategory(item);
                        setValue(item);
                        onOpen();
                      }}
                      key={item.title}
                    >
                      <Item
                        onContextMenu={() => {
                          setContextMenuShow(true);
                        }}
                        type={item.type}
                        key={item.title}
                        category={item.title}
                      />
                    </ListboxItem>
                  )}
                </Listbox>
              </CardBody>
              <CardFooter>
                <Button
                  onPress={() => {
                    setFocusType(categoryIndex);
                    onOpen();
                  }}
                  variant="flat"
                  radius="sm"
                  className="w-full"
                  size="sm"
                >
                  添加
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Modal isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {focusCategory ? "编辑" : "添加"}{" "}
                {categoryList[focusType].title}分类
              </ModalHeader>
              <ModalBody>
                <Input
                  label="分类名称"
                  placeholder="请输入分类名称"
                  value={value?.title}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setValue(undefined);
                      return;
                    }
                    if (value) {
                      setValue({
                        ...value,
                        title: e.target.value,
                        created_at: new Date().getTime(),
                        updated_at: new Date().getTime(),
                      });
                    } else {
                      setValue({
                        id: createId(),
                        title: e.target.value,
                        type: focusType,
                        color: "",
                        created_at: new Date().getTime(),
                        updated_at: new Date().getTime(),
                      });
                    }
                  }}
                />
              </ModalBody>
              <ModalFooter>
                {!focusCategory ? (
                  <Button
                    color="danger"
                    variant={"light"}
                    onPress={() => {
                      onClose();
                      setValue(undefined);
                      setFocusCategory(undefined);
                    }}
                  >
                    {"关闭"}
                  </Button>
                ) : (
                  <PopoverConfirm
                    title="确认删除分类"
                    desc="删除改分类会导致关联的数据失去分类，可能会导致某些查询数据发生改变"
                    placement="bottom"
                    onOk={async () => {
                      const [err] = await to(
                        database
                          .delete(category)
                          .where(eq(category.id, focusCategory.id))
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
                        queryClient.invalidateQueries("category");
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
                  isDisabled={!value}
                  isLoading={loading}
                  onPress={async () => {
                    if (value) {
                      setLoading(true);
                      const [err] = await to(
                        focusCategory
                          ? database
                              .update(category)
                              .set({
                                title: value.title,
                                updated_at: new Date().getTime(),
                              })
                              .where(eq(category.id, value.id))
                              .execute()
                          : database.insert(category).values(value).execute()
                      );
                      if (!err) {
                        setValue(undefined);
                        setFocusCategory(undefined);
                        notification.open({
                          placement: "bottomRight",
                          style: {
                            height: 60,
                          },
                          type: "success",
                          message: focusCategory ? "编辑成功" : "创建成功",
                        });
                        queryClient.invalidateQueries("category");
                        onClose();
                      }
                      setLoading(false);
                    }
                  }}
                >
                  {focusCategory ? "编辑" : "创建"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Category;
