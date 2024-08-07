import { Divider, Steps, notification } from "antd";
import { type Transaction } from "../../../electron/db/schema";
import { Edge, HandleType, OnReconnect } from "@xyflow/react";
import {
  Node,
  Position,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { GridColumn } from "@glideapps/glide-data-grid";
import OpenAI from "openai";
import { useQuery } from "react-query";
import { database } from "@/db";
import { atom, useAtom } from "jotai";
import { category, type Account } from "../../../electron/db/schema";
import { FC, useMemo, useState, useEffect, useRef, useCallback } from "react";
import Step1 from "./components/step1";
import Step2 from "./components/step2";
import Step3 from "./components/step3";
import Display from "./components/display";
import { CN_ACCOUNTS, CN_ACCOUNTS_TEMPLATE } from "@/constant";
export const accountAtom = atom<Account | undefined>(undefined);
export interface DataMappingProps {}
const client = new OpenAI({
  apiKey: "sk-710bf3fdf2fe4fa6bca027e50b7c5007", // This is the default and can be omitted
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.deepseek.com",
});
function convertData(
  sourceData: string[][],
  conversionRules: Edge[],
  columns: string[],
  account?: Account
) {
  // 创建源列名到目标列名的映射
  const columnMap = new Map<string, { target: string; index: number }>();
  conversionRules.forEach((rule, index) => {
    const sourceIndex = columns.indexOf(rule.source);
    columnMap.set(rule.source, { target: rule.target, index: sourceIndex });
  });

  sourceData.forEach((item, index) => {
    if (item.length < columns.length) {
      sourceData[index] = [
        ...item,
        ...new Array(columns.length - item.length).fill(""),
      ];
    }
  });

  // 转换数据
  return sourceData.map((row, rowIndex) => {
    const resultRow: any = {};
    const amountRulesLenght = conversionRules.filter(
      (item) => item.target === "amount"
    ).length;

    conversionRules.forEach((rule) => {
      const sourceIndex = columnMap.get(rule.source)?.index;
      if (sourceIndex !== undefined) {
        row[sourceIndex] = row[sourceIndex]?.trim();
        // 特殊处理当tartget为type和amount的时候的时候, 并且有两个target为type和amount的时候
        if (rule.target === "amount" || rule.target === "type") {
          // 如果source的里面包含支出那么type是1，如果是收入那么type是0,并且amount里面必须是数字
          if (amountRulesLenght === 2) {
            if (rule.target === "amount") {
              row[sourceIndex] = row[sourceIndex].replace(/,/g, "");
              if (
                columns[sourceIndex].includes("支出") &&
                row[sourceIndex] &&
                !isNaN(Number(row[sourceIndex]))
              ) {
                resultRow["amount"] = row[sourceIndex];
                resultRow["type"] = 1;
              } else if (
                columns[sourceIndex].includes("收入") &&
                row[sourceIndex] &&
                !isNaN(Number(row[sourceIndex]))
              ) {
                resultRow["amount"] = row[sourceIndex];
                resultRow["type"] = 0;
              }
            }
          } else {
            if (rule.target === "type") {
              if (row[sourceIndex] === "/") {
                resultRow[rule.target] = 1;
              } else {
                resultRow[rule.target] =
                  row[sourceIndex]?.trim() === "支出" ? 1 : 0;
              }
            } else if (rule.target === "amount") {
              resultRow[rule.target] = row[sourceIndex].replace("¥", "");
            }
          }
        } else {
          resultRow[rule.target] = row[sourceIndex];
        }
      }
    });
    return resultRow;
  });
}

const DataMapping: FC<DataMappingProps> = () => {
  const location = useLocation();
  const data: Array<string[]> = location.state?.data;
  // 先给每一行元素后面的空字符全全部去除
  data.forEach((item) => {
    while (item[item.length - 1] === "") {
      item.pop();
    }
  });
  // 获取data 每个元素的length，每个元素有值才算length，空字符串也不算
  const maxLength = Math.max(
    ...data.map((item) => {
      return item.length;
    })
  );
  // 找到第一个最大行的index
  const headerIndex = data.findIndex((item) => {
    return item.filter((v) => v !== "").length === maxLength;
  });
  // 第一行作为column
  const columns = useMemo(() => data[headerIndex], [data]);

  const sourceColumns: GridColumn[] = [
    {
      title: "交易时间",
      id: "date",
      themeOverride: { borderColor: "transparent" },
    },
    { title: "收/支(自动判断)", id: "type" },
    { title: "内容", id: "content" },
    { title: "金额(自动判断)", id: "amount" },
    { title: "描述", id: "description" },
  ];
  const initialNodes: Node[] = [
    ...columns.map(
      (item, index) =>
        ({
          id: `${item}`,
          sourcePosition: Position.Right,
          type: "input",
          position: { x: 24, y: 50 * index + 16 },
          className: "",
          style: {
            border: "none",
            background: "#F9F9FA",
            borderRadius: 8,
            fontSize: 12,
          },
          data: { label: item },
        } as Node)
    ),
    ...sourceColumns.map((item, index) => {
      return {
        id: `${item.id}`,
        // targetPosition: Position.Left,
        type: "custom",
        position: { x: 500, y: 50 * index + 16 },
        className: "",
        style: {
          border: "none",
          background: "#F9F9FA",
          borderRadius: 8,
          fontSize: 12,
        },

        data: { label: item.title },
      } as Node;
    }),
  ];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  useEffect(() => {
    // generateEdgeByAI(columns).then((v) => {
    //   if (v) {
    //     setEdges(v);
    //   }
    // });
  }, []);

  const edgeReconnectSuccessful = useRef(true);
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect: OnReconnect<Edge> = useCallback(
    (oldEdge, newConnection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    []
  );

  const onReconnectEnd: (
    event: MouseEvent | TouchEvent,
    edge: Edge,
    handleType: HandleType
  ) => void = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);
  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );
  const navigate = useNavigate();
  const { data: categoryList } = useQuery("category", {
    queryFn: async () => {
      const res1 = (await database.select().from(category)).filter(
        (item) => item.type === 0
      );
      const res2 = (await database.select().from(category)).filter(
        (item) => item.type === 1
      );
      const res3 = (await database.select().from(category)).filter(
        (item) => item.type === 2
      );
      return [res1, res2, res3];
    },
  });
  const [currentAccount, setCurrentAccount] = useAtom(accountAtom);
  // 获取state
  const [current, setCurrent] = useState(0);

  const onChange = (value: number) => {
    setCurrent(value);
  };

  const { data: accounts } = useQuery("accounts", {
    queryFn: async () => {
      return database.query.accounts.findMany();
    },
  });
  const [selectValue, setSelectValue] = useState<Account>();
  // 从第二行到最后一行是数据，并且数组长度和column长度一致,并且utf-8编码
  const rows = data
    .filter((item, index) => index >= headerIndex + 1)
    .filter((item) => item.length > 10);

  const convertedData = useMemo(() => {
    return convertData(rows, edges, columns, currentAccount);
  }, [edges, columns, currentAccount]);
  const [editData, seteditData] = useState<Transaction[]>();
  useEffect(() => {
    seteditData(convertedData as unknown as Transaction[]);
  }, [convertedData]);
  const renderSteps = () => {
    switch (current) {
      case 0:
        return (
          <Step1
            columns={columns}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
          />
        );
      case 1:
        return <Display data={editData} />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return null;
    }
  };
  const [showAccountModal, setShowAccountModal] = useState(true);
  return (
    <div className="px-12 py-8  mx-auto overflow-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-4">
            <div>数据导入</div>
            <Button
              onClick={() => setShowAccountModal(true)}
              variant="flat"
              radius="sm"
            >
              {currentAccount?.title}
            </Button>
          </h1>
        </div>
      </div>
      <Divider className="my-6" />
      <Steps
        current={current}
        onChange={onChange}
        items={[
          {
            title: "数据匹配",
            description: "匹配表头",
          },
          {
            title: "数据展示",
            description: "显示转换数据，调整",
          },
          {
            title: "自动分类",
            description: "AI自动分类",
          },
          {
            title: "保存数据",
            description: "成功入库",
          },
        ]}
      />
      <div className="py-8 pb-0">
        {renderSteps()}
        <div className="flex justify-center gap-4">
          {current > 0 ? (
            <Button
              radius="sm"
              color="primary"
              className="mt-4"
              onClick={() => {
                setCurrent(current - 1);
              }}
              size="sm"
              variant="flat"
            >
              上一步
            </Button>
          ) : null}
          {current < 2 ? (
            <Button
              radius="sm"
              onClick={() => {
                setCurrent(current + 1);
              }}
              color="primary"
              className="mt-4"
              size="sm"
              variant="flat"
            >
              下一步
            </Button>
          ) : null}
        </div>
      </div>
      <Modal
        hideCloseButton
        defaultOpen
        isOpen={showAccountModal}
        onOpenChange={setShowAccountModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                选择账户
              </ModalHeader>
              <ModalBody>
                <Select
                  onSelectionChange={(keys) => {
                    const values = Array.from(keys) as string[];
                    setSelectValue(accounts?.find((v) => v.id === values[0]));
                  }}
                  size="sm"
                  selectedKeys={new Set([selectValue?.id]) as any}
                  label="账户选择"
                  className="max-w-full"
                >
                  {accounts?.map((account) => (
                    <SelectItem key={account.id}>{account.title}</SelectItem>
                  )) ?? []}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    navigate("/");
                  }}
                >
                  取消导入
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    if (!selectValue) {
                      notification.warning({
                        placement: "bottomRight",
                        style: {
                          height: 60,
                        },
                        message: "请选择账户",
                      });
                    } else {
                      setCurrentAccount(selectValue);
                      setEdges(
                        JSON.parse(
                          CN_ACCOUNTS_TEMPLATE[selectValue.title as CN_ACCOUNTS]
                        )
                      );
                      onClose();
                    }
                  }}
                >
                  确认
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DataMapping;
