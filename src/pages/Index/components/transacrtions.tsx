import "@glideapps/glide-data-grid/dist/index.css";

import type { Account } from "../../../../electron/db/schema";
import {
  DataEditor,
  DrawCellCallback,
  GridCell,
  GridCellKind,
  GridColumn,
  Item,
} from "@glideapps/glide-data-grid";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import React from "react";

const data = [
  {
    id: 1,
    transaction_id: "tx1",
    date: 1639253243000,
    content: "内容1",
    amount: 326,
    type: "收入",
    description: "描述1",
  },
  {
    id: 2,
    transaction_id: "tx2",
    date: 1639253353000,
    content: "内容2",
    amount: 683,
    type: "支出",
    description: "描述2",
  },
  {
    id: 3,
    transaction_id: "tx3",
    date: 1639253463000,
    content: "内容3",
    amount: 177,
    type: "收入",
    description: "描述3",
  },
  {
    id: 4,
    transaction_id: "tx4",
    date: 1639253573000,
    content: "内容4",
    amount: 961,
    type: "支出",
    description: "描述4",
  },
  {
    id: 5,
    transaction_id: "tx5",
    date: 1639253953000,
    content: "内容5",
    amount: 421,
    type: "收入",
    description: "描述5",
  },
  {
    id: 6,
    transaction_id: "tx6",
    date: 1639254063000,
    content: "内容6",
    amount: 728,
    type: "支出",
    description: "描述6",
  },
  {
    id: 7,
    transaction_id: "tx7",
    date: 1639254173000,
    content: "内容7",
    amount: 391,
    type: "收入",
    description: "描述7",
  },
  {
    id: 8,
    transaction_id: "tx8",
    date: 1639254283000,
    content: "内容8",
    amount: 659,
    type: "支出",
    description: "描述8",
  },
  {
    id: 9,
    transaction_id: "tx9",
    date: 1639254393000,
    content: "内容9",
    amount: 129,
    type: "收入",
    description: "描述9",
  },
  {
    id: 10,
    transaction_id: "tx10",
    date: 1639254501000,
    content: "内容10",
    amount: 285,
    type: "支出",
    description: "描述10",
  },
];

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
const columns: GridColumn[] = [
  { title: "ID", id: "id", themeOverride: { borderColor: "transparent" } },
  { title: "收/支", id: "type" },
  { title: "内容", id: "content" },
  { title: "金额", id: "amount" },
  { title: "类别", id: "type" },
  { title: "描述", id: "description" },
  { title: "源文本", id: "source" },
];

// If fetching data is slow you can use the DataEditor ref to send updates for cells
// once data is loaded.
function getData([col, row]: Item): GridCell {
  const person = data[row];
  switch (col) {
    case 0:
      return {
        kind: GridCellKind.Text,
        data: person.id + "",
        allowOverlay: false,
        style: "faded",
        displayData: person.id + "",
      };
    case 1:
      return {
        kind: GridCellKind.Text,
        data: person.content + "",
        allowOverlay: false,
        displayData: person.content + "",
      };
    case 2:
      return {
        kind: GridCellKind.Number,
        data: person.amount,
        allowOverlay: false,
        displayData: person.amount + "",
      };

    case 3:
      return {
        kind: GridCellKind.Text,
        data: person.type + "",
        allowOverlay: false,
        displayData: person.type + "",
        themeOverride: {
          borderColor: "transparent",
        },
      };
    default:
      return {
        kind: GridCellKind.Text,
        data: person.description + "",
        allowOverlay: false,
        displayData: person.description + "",
      };
  }
}

export default function Transactions({ account }: { account: Account }) {
  const [colsMap, setColsMap] = React.useState(columns);
  const onColumnResize = React.useCallback(
    (column: GridColumn, newSize: number) => {
      setColsMap((prevColsMap) => {
        const index = prevColsMap.findIndex((ci) => ci.title === column.title);
        const newArray = [...prevColsMap];
        newArray.splice(index, 1, {
          ...prevColsMap[index],
          width: newSize,
        });
        return newArray;
      });
    },
    []
  );
  const drawCell: DrawCellCallback = React.useCallback((args, draw) => {
    draw(); // draw up front to draw over the cell
    const { ctx, rect } = args;
  }, []);
  return (
    <div>
      <h3 className="mb-2">{account.title}</h3>
      <Card radius="sm" shadow="sm">
        <CardBody className="p-0">
          <DataEditor
            columns={colsMap}
            // maxColumnAutoWidth={500}
            theme={React.useMemo(
              () => ({
                baseFontStyle: "0.8125rem",
                headerFontStyle: "600 0.8125rem",
                editorFontSize: "0.8125rem",
              }),
              []
            )}
            verticalBorder={false}
            drawCell={drawCell}
            // scaleToRem={true}
            getCellContent={getData}
            rows={data.length}
            onColumnResize={onColumnResize}
          />
        </CardBody>
      </Card>
    </div>
  );
}
