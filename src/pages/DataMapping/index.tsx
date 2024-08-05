import { Divider, Steps } from "antd";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Node,
  Position,
  ReactFlow,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLocation } from "react-router-dom";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { GridColumn } from "@glideapps/glide-data-grid";
import { SingleHandleNodeTarget } from "./components/SingleHandNode";
import OpenAI from "openai";
import { useQuery } from "react-query";
import { database } from "@/db";
import { atom } from "jotai";
import { type Account } from "../../../electron/db/schema";
import { set } from "lodash";
const accountAtom = atom<Account | undefined>(undefined);
export interface DataMappingProps {}
const nodeTypes = {
  custom: SingleHandleNodeTarget,
};
const client = new OpenAI({
  apiKey: "sk-710bf3fdf2fe4fa6bca027e50b7c5007", // This is the default and can be omitted
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.deepseek.com",
});
function extractAndParseJSON(input: string) {
  // 使用正则表达式提取JSON内容
  const jsonMatch = input.match(/```json\n([\s\S]*?)\n```/);

  if (!jsonMatch) {
    throw new Error("No JSON content found in the input string");
  }

  const jsonContent = jsonMatch[1];

  try {
    // 解析JSON内容
    const parsedData = JSON.parse(jsonContent);
    return parsedData;
  } catch (error) {
    throw new Error(
      "Failed to parse JSON content: " + (error as Error).message
    );
  }
}

async function generateEdgeByAI(columns: string[]) {
  const prompt = `
    这是source节点的例子，source节点可能会有变化
["交易时间","交易分类","交易对方","对方账号","商品说明","收/支","金额","收/付款方式","交易状态","交易订单号","商家订单号","备注"] \n
这是target节点
[{"title":"ID","id":"id","themeOverride":{"borderColor":"transparent"}},{"title":"交易时间","id":"id","themeOverride":{"borderColor":"transparent"}},{"title":"收/支","id":"type"},{"title":"内容","id":"content"},{"title":"金额","id":"amount"},{"title":"描述","id":"description"}] \n
这是他们关联之后的数据结构 \n
[{"source":"交易时间","target":"id","id":"xy-edge__交易时间-id"},{"source":"收/支","target":"type","id":"xy-edge__收/支-type"},{"source":"金额","target":"amount","id":"xy-edge__金额-amount"},{"source":"商品说明","target":"content","id":"xy-edge__商品说明-content"},{"source":"备注","target":"description","id":"xy-edge__备注-description"}] \n
记下来我会给你发送类似的source节点，target节点是不变的，请你给我返回json数据格式的，关联数据结构

    `;
  const chatCompletion = await client.chat.completions.create({
    stream: false,
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: JSON.stringify(columns),
      },
    ],
    model: "deepseek-chat",
  });
  const content = chatCompletion.choices[0].message.content;
  if (content) {
    const json = extractAndParseJSON(content);
    return json;
  }
}
const Step1 = ({ columns }: { columns: string[] }) => {
  const sourceColumns: GridColumn[] = [
    { title: "ID", id: "id", themeOverride: { borderColor: "transparent" } },
    {
      title: "交易时间",
      id: "id",
      themeOverride: { borderColor: "transparent" },
    },
    { title: "收/支", id: "type" },
    { title: "内容", id: "content" },
    { title: "金额", id: "amount" },
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
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  return (
    <div>
      <div style={{ width: "", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          fitView
        />
      </div>
      <div>
        {columns.map((item, index) => {
          return (
            <Input
              className="max-w-[100px] mb-4"
              isDisabled
              size="sm"
              labelPlacement="outside"
              value={item}
              key={item}
            />
          );
        })}
      </div>
    </div>
  );
};
const Step2 = () => {
  return <div>step2</div>;
};
const Step3 = () => {
  return <div>step3</div>;
};

const DataMapping: FC<DataMappingProps> = () => {
  const location = useLocation();

  // 获取state
  const data: Array<string[]> | undefined = location.state?.data;
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
  if (data) {
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
    const columns = data[headerIndex];

    // 从第二行到最后一行是数据，并且数组长度和column长度一致,并且utf-8编码
    const rows = data
      .filter((item, index) => index == headerIndex + 1)
      .filter((item) => item.length === columns.length);

    const renderSteps = () => {
      switch (current) {
        case 0:
          return <Step1 columns={columns} />;
        case 1:
          return <Step2 />;
        case 2:
          return <Step3 />;
        default:
          return <Step1 columns={columns} />;
      }
    };
    return (
      <div className="px-12 py-8  mx-auto overflow-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold">数据导入</h1>
          </div>
        </div>
        <Divider className="my-6" />
        <Steps
          current={current}
          onChange={onChange}
          items={[
            {
              title: "数据转换",
              description: "AI匹配表头",
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
        <div className="py-8">{renderSteps()}</div>
        <Modal defaultOpen>
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
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      // set(accountAtom, selectValue);
                      onClose();
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
  }
  return <div className="px-12 py-8  mx-auto overflow-auto">没有数据</div>;
};

export default DataMapping;
