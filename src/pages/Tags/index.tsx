import { PageWrapper } from "@/components/PageWrapper";
import { ColDef } from "ag-grid-community";
import { Button, Divider, Tooltip } from "@nextui-org/react";
import { AgGridReact } from "ag-grid-react";
import { FC, useState } from "react";
import { Tag } from "@db/schema";
import { EditTag, useTagService } from "@/api/hooks/tag";
import TagEditModal from "@/components/TagEditModal";
import SelectedRowsActions from "@/components/Transactions/components/SelectedRowsActions";
import { TagService } from "@/api/services/TagService";
import to from "await-to-js";
import { message } from "antd";
import { useAtom } from "jotai";
import { ShowTagEditModalAtom } from "@/globals";
export interface TagsProps {}
const Tags: FC<TagsProps> = () => {
  const { tags, deleteTags, editTag } = useTagService();
  const [colDefs, setColDefs] = useState<
    ColDef<Tag & { transactionCount: number }>[]
  >([
    {
      field: "id",
      headerName: "",
      width: 36,
      resizable: false,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
    },
    {
      field: "name",
      headerName: "标签名称",
      editable: true,
      resizable: false,
      cellRenderer: (params) => {
        return <div>#{params.value}</div>;
      },
    },
  ]);
  const [selectedRows, setSelectedRows] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useAtom(ShowTagEditModalAtom);
  return (
    <PageWrapper title="标签">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">标签</h1>
        </div>
        <Tooltip delay={300} content="快捷键 Shift + T 唤起">
          <Button
            size="sm"
            radius="sm"
            color="primary"
            onPress={() => setIsOpen(true)}
          >
            创建标签
          </Button>
        </Tooltip>
      </div>
      <Divider className="my-6" />
      <div className="ag-theme-custom" style={{ width: 500, height: 500 }}>
        <AgGridReact
          rowData={tags}
          onCellValueChanged={async (e) => {
            const editBody = {
              [e.colDef.field as string]: e.newValue,
            };
            if (e.colDef.field === "name") {
              const [err, res] = await to(
                TagService.checkTagName(e.newValue, e.data.book_id)
              );

              if (res) {
                e.data.name = e.oldValue;
                e.api.applyTransaction({
                  update: [e.data],
                });
                message.error("标签名称已存在");
                return;
              }
              editTag({ tagId: e.data.id, tag: editBody as EditTag });
            }
          }}
          onSelectionChanged={(e) => {
            const nodes = e.api.getSelectedNodes();
            const rows = nodes.map((node) => node.data);
            setSelectedRows(rows);
          }}
          columnDefs={colDefs}
          rowSelection="multiple"
          suppressRowClickSelection={true}
        />
      </div>
      <SelectedRowsActions
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        deleteTransactions={deleteTags as any}
      />
    </PageWrapper>
  );
};

export default Tags;
