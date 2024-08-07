import "@glideapps/glide-data-grid/dist/index.css";
import * as ReactVTable from "@visactor/react-vtable";
import { type Transaction } from "../../../../electron/db/schema";
import { GridColumn } from "@glideapps/glide-data-grid";
import { Card, CardBody } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import NumberEditor from "@/components/Editor/components/number-editor";
import InputEditor from "@/components/Editor/components/input";
import DateEditor from "@/components/Editor/components/date-editor";
import SelectEditor from "@/components/Editor/components/select-editor";

type TransactionKey = keyof Transaction;
// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
const columns: GridColumn[] = [
  { title: "列数", id: "index" },
  { title: "内容", id: "content", width: 80 },
  { title: "金额", id: "amount" },
  { title: "收/支", id: "type" },
  { title: "账户", id: "category" },
  { title: "类别", id: "type" },
  { title: "描述", id: "description" },
  { title: "源文本", id: "source" },
];

// If fetching data is slow you can use the DataEditor ref to send updates for cells
// once data is loaded.

const inputEditor = new InputEditor();
const numberEditor = new NumberEditor();
const dateEditor = new DateEditor();
const selectEditor = new SelectEditor();
interface CellRange {
  start: CellAddress;
  end: CellAddress;
}
interface CellAddress {
  col: number;
  row: number;
}
ReactVTable.VTable.register.editor("input-editor", inputEditor);
ReactVTable.VTable.register.editor("number-editor", numberEditor);
ReactVTable.VTable.register.editor("date-editor", dateEditor);
ReactVTable.VTable.register.editor("select-editor", selectEditor);
export default function Transactions({
  data: transactions = [],
}: {
  data?: Transaction[];
}) {
  const tableData = transactions.map((transaction, index) => ({
    index: index + 1,
    ...transaction,
  }));

  const [selectedRow, setSelectedRow] = useState<number[]>([]);
  const option = {
    columns: [
      {
        field: "check",
        title: "",
        headerType: "checkbox",
        width: 16,
        cellType: "checkbox",
        headerStyle: {
          textAlign: "center",
        },
        style: {
          color: "#757575",
          textAlign: "center",
        },
        disableHeaderSelect: true,
        disableColumnResize: true,
        // cellType: "checkbox",
      },
      {
        field: "date",
        title: "日期",
        disableHeaderSelect: true,
        editor: "date-editor",
      },
      {
        field: "content",
        title: "内容",
        disableHeaderSelect: true,
        editor: "input-editor",
      },
      {
        field: "amount",
        title: "金额",
        disableHeaderSelect: true,
        style: {
          textAlign: "right",
        },
        editor: "number-editor",
      },
      { field: "type", title: "收/支", disableHeaderSelect: true },
      { field: "category", title: "账户", disableHeaderSelect: true },
      {
        field: "type",
        title: "类别",
        disableHeaderSelect: true,
        editor: "select-editor",
      },
      {
        field: "description",
        title: "补充",
        disableHeaderSelect: true,
        editor: "input-editor",
      },
      { field: "source", title: "源文本", disableHeaderSelect: true },
    ],
    select: {
      highlightMode: "row", // 可以配置为'cross' 或者 'row' 或者 'column'
    },
    editCellTrigger: "doubleclick",
    widthMode: "adaptive",
    heightMode: "autoHeight",
    hover: {
      highlightMode: "row",
    },
    records: tableData,
    theme: {
      defaultStyle: {
        borderLineWidth: 0,
      },
      bodyStyle: {
        fontSize: 14,
        hover: {
          cellBgColor: "#E5E5E8",
          inlineRowBgColor: "#F7F7F7",
          inlineColumnBgColor: "#E5E5E8",
        },
      },
      selectionStyle: {
        cellBorderLineWidth: 2,
        cellBorderColor: "#006FEE",
        cellBgColor: "rgba(0, 111, 238, 0.2)",
        inlineRowBgColor: "#E5E5E8",
        inlineColumnBgColor: "",
      },
      headerStyle: {
        bgColor: "#F4F4F5",
        color: "#757575",
        cornerRadius: 12,
        fontWeight: "bold",
        padding: 12,
      },
    },
  };
  const ref = useRef<any>(null);
  const selectedRowRef = useRef<number[]>([]);
  useEffect(() => {
    if (ref.current) {
      console.log(ref.current);

      // ref.current.register.editor("input-editor", inputEditor);
    }
  }, [ref.current]);
  useEffect(() => {
    if (selectedRow.length > 0) {
      // 行数是连在一起的行生成一个CellRange
      // 对选中的行进行排序
      const sortedRows = [...selectedRow].sort((a, b) => a - b);
      const cellRanges: CellRange[] = [];
      let startRow = sortedRows[0];
      let endRow = startRow;

      for (let i = 1; i < sortedRows.length; i++) {
        if (sortedRows[i] === endRow + 1) {
          // 如果当前行与前一行连续，则更新endRow
          endRow = sortedRows[i];
        } else {
          // 如果不连续，则创建一个新的CellRange并重置startRow和endRow
          cellRanges.push({
            start: { col: 1, row: startRow },
            end: { col: 10, row: endRow },
          });
          startRow = sortedRows[i];
          endRow = startRow;
        }
      }

      // 添加最后一个CellRange
      cellRanges.push({
        start: { col: 1, row: startRow },
        end: { col: 10, row: endRow },
      });
      console.log(cellRanges);

      ref.current.selectCells(cellRanges);
    }
    selectedRowRef.current = selectedRow;
  }, [selectedRow]);

  const onClearCheckbox = () => {
    selectedRowRef.current.forEach((row) => {
      ref.current?.setCellCheckboxState(0, row, false);
    });
  };
  return (
    <>
      <div style={{ height: "calc(100vh - 280px)" }}>
        <Card className="h-full">
          <CardBody>
            <Card className="h-full" shadow="none" radius="sm">
              <ReactVTable.ListTable
                ref={ref}
                onClickCell={(props: { col: number }) => {
                  if (props.col !== 0) {
                    onClearCheckbox();
                    setSelectedRow([]);
                  }
                }}
                onCheckboxStateChange={(props: {
                  col: number;
                  row: number;
                  checked: boolean;
                }) => {
                  console.log(props);

                  setSelectedRow((pre) => {
                    if (props.row === 0 && props.col === 0) {
                      if (props.checked) {
                        // 所有行
                        return Array.from(
                          { length: transactions.length },
                          (_, index) => index + 1
                        );
                      } else {
                        ref.current?.clearSelected();
                        return [];
                      }
                    }
                    if (pre.includes(props.row)) {
                      return pre.filter((row) => row !== props.row);
                    } else {
                      return [...pre, props.row];
                    }
                  });
                }}
                option={option}
              />
            </Card>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
