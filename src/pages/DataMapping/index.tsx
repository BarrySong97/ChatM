import { Divider, Steps } from "antd";
import React, { FC, useCallback, useRef, useState } from "react";
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
import { Input } from "@nextui-org/react";
import { GridColumn } from "@glideapps/glide-data-grid";
import { SingleHandleNodeTarget } from "./components/SingleHandNode";

export interface DataMappingProps {}
const nodeTypes = {
  custom: SingleHandleNodeTarget,
};
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
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { source: "交易时间", target: "id", id: "xy-edge__交易时间-id" },
    { source: "收/支", target: "type", id: "xy-edge__收/支-type" },
    { source: "金额(元)", target: "amount", id: "xy-edge__金额(元)-amount" },
    { source: "商品", target: "content", id: "xy-edge__商品-content" },
    { source: "备注", target: "description", id: "xy-edge__备注-description" },
  ]);
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
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  console.log(JSON.stringify(columns));
  console.log(JSON.stringify(sourceColumns));
  console.log(JSON.stringify(edges));

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
    console.log("onChange:", value);
    setCurrent(value);
  };

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
    console.log(rows);

    const renderSteps = () => {
      switch (current) {
        case 0:
          return <Step1 columns={columns} />;
        case 1:
          return <Step2 />;
        case 2:
          return <Step3 />;
        default:
          return <Step1 />;
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
              description: "匹配表头，确认账户，方便数据转换",
            },
            {
              title: "数据调整",
              description: "生成数据，使用AI自动分类",
            },
            {
              title: "保存数据",
              description: "成功入库",
            },
          ]}
        />
        <div className="py-8">{renderSteps()}</div>
      </div>
    );
  }
  return <div className="px-12 py-8  mx-auto overflow-auto">没有数据</div>;
};

export default DataMapping;
