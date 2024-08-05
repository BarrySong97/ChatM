import React, { memo } from "react";
import { Node, Position } from "@xyflow/react";
import { Handle, useHandleConnections } from "@xyflow/react";
const CustomHandle = (props: any) => {
  const connections = useHandleConnections({
    type: props.type,
  });

  return (
    <Handle
      {...props}
      isConnectable={connections.length < props.connectionCount}
    />
  );
};

const SingleHandleNodeTarget = ({ data }: Node) => {
  return (
    <div>
      <CustomHandle
        type="target"
        position={Position.Left}
        connectionCount={1}
      />
      <div
        className="p-2.5 rounded-small w-[150px] text-center"
        style={{
          border: "none",
          background: "#F9F9FA",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        {data.label}
      </div>
    </div>
  );
};
export { SingleHandleNodeTarget };
