import "@glideapps/glide-data-grid/dist/index.css";
import { type Transaction } from "../../../../electron/db/schema";
import {
  DataEditor,
  DrawCellCallback,
  GridCell,
  GridCellKind,
  GridColumn,
  Item,
} from "@glideapps/glide-data-grid";
import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { useAtom } from "jotai";
import { accountAtom } from "..";

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
const columns: GridColumn[] = [
  { title: "内容", id: "content" },
  { title: "金额", id: "amount" },
  { title: "收/支", id: "type" },
  { title: "账户", id: "category" },
  { title: "类别", id: "type" },
  { title: "描述", id: "description" },
  { title: "源文本", id: "source" },
];

// If fetching data is slow you can use the DataEditor ref to send updates for cells
// once data is loaded.

export default function Transactions({
  data: transactions,
}: {
  data: Transaction[];
}) {
  const [currentAccount, setCurrentAccount] = useAtom(accountAtom);
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
  function getData([col, row]: Item): GridCell {
    const item = transactions[row];

    switch (col) {
      case 0:
        return {
          kind: GridCellKind.Text,
          data: item.content + "",
          allowOverlay: false,
          displayData: item.content + "",
        };
      case 1:
        return {
          kind: GridCellKind.Number,
          data: Number(item.amount),
          allowOverlay: false,
          displayData: item.amount + "",
        };

      case 2:
        const type = item.type === 1 ? "支出" : "收入";

        return {
          kind: GridCellKind.Bubble,
          data: [type ?? ""],
          allowOverlay: false,
          themeOverride: {
            borderColor: "transparent",
          },
        };
      case 3:
        return {
          kind: GridCellKind.Bubble,
          data: [currentAccount?.title ?? ""],
          allowOverlay: false,
        };
      default:
        return {
          kind: GridCellKind.Text,
          data: item.description ?? "",
          allowOverlay: false,
          displayData: item.description ?? "",
        };
    }
  }
  return (
    <div style={{ width: "", height: "calc(100vh - 280px)" }}>
      <Card className="h-full">
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
          getCellContent={getData}
          rows={transactions?.length ?? 0}
          onColumnResize={onColumnResize}
        />
      </Card>
    </div>
  );
}
