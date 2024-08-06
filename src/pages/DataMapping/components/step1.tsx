import {
  Edge,
  HandleType,
  Node,
  NodeTypes,
  OnReconnect,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SingleHandleNodeTarget } from "./SingleHandNode";
import OpenAI from "openai";
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
interface Step1Props {
  columns: string[];
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: any) => void;
  onReconnect: OnReconnect<Edge>;
  onReconnectStart: () => void;
  onReconnectEnd: (
    event: MouseEvent | TouchEvent,
    edge: Edge,
    handleType: HandleType
  ) => void;
}
const Step1 = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onReconnect,
  onReconnectStart,
  onReconnectEnd,
}: Step1Props) => {
  return (
    <div>
      <div style={{ width: "", height: "calc(100vh - 280px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes as unknown as NodeTypes}
          onConnect={onConnect}
          fitView
        />
      </div>
    </div>
  );
};
export default Step1;
