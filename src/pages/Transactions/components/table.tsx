import React from "react";
import {
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  Link,
} from "@nextui-org/react";
import { columns, users, statusOptions } from "./data";
import { capitalize } from "./utils";
import {
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
  VerticalDotsIcon,
} from "./PluseIcon";
import { ConfigProvider, Table, TableProps, Tag } from "antd";

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["name", "role", "status", "actions"];

type User = (typeof users)[0];
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}
export default function TransactionsTable() {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(users.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(user.status)
      );
    }

    return filteredUsers;
  }, [users, filterValue, statusFilter]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: User, b: User) => {
      const first = a[sortDescriptor.column as keyof User] as number;
      const second = b[sortDescriptor.column as keyof User] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search by name..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              className="bg-foreground text-background"
              endContent={<PlusIcon />}
              size="sm"
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {users.length} users
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    users.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${items.length} selected`}
        </span>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);
  const columns: TableProps<DataType>["columns"] = [
    {
      title: "日期",
      dataIndex: "name",
      key: "name",
      width: 100,
      render(value, record, index) {
        return <div>2024/03/09</div>;
      },
    },
    {
      title: "类型",
      dataIndex: "address",
      key: "address",
      width: 60,
      render(value, record, index) {
        return (
          <div>
            <Tag color="processing" bordered={false}>
              支出
            </Tag>
          </div>
        );
      },
    },
    {
      title: "内容",
      dataIndex: "age",
      width: 200,
      key: "age",
      render(value, record, index) {
        return <div>交易内容</div>;
      },
    },
    {
      title: "金额",
      dataIndex: "address",
      align: "right",
      key: "address",
      render(value, record, index) {
        return <div>1000</div>;
      },
    },
    {
      title: "来源",
      dataIndex: "address",
      key: "address",
      align: "right",
      render(value, record, index) {
        return (
          <div>
            <Tag className="mr-0" color="processing" bordered={false}>
              支付宝
            </Tag>
          </div>
        );
      },
    },
    {
      title: "流向",
      dataIndex: "address",
      key: "address",
      align: "right",
      render(value, record, index) {
        return (
          <div>
            <Tag className="mr-0" color="green" bordered={false}>
              健身
            </Tag>
          </div>
        );
      },
    },
    {
      title: "#标签",
      dataIndex: "address",
      key: "address",
      align: "center",
      render(value, record, index) {
        return (
          <div className="">
            <Link size="sm" href="#" underline="always">
              #Active
            </Link>
          </div>
        );
      },
    },
    {
      title: "补充",
      dataIndex: "address",
      key: "address",
      align: "right",
    },
  ];

  const data: DataType[] = [
    {
      key: "1",
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
      tags: ["nice", "developer"],
    },
    {
      key: "2",
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
      tags: ["loser"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
  ];
  return (
    <div>
      {topContent}
      <div className="transactions-table">
        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "transparent",
                headerSplitColor: "transparent",
              },
            },
          }}
        >
          <Table pagination={false} columns={columns} dataSource={data}></Table>
        </ConfigProvider>
      </div>
      {bottomContent}
    </div>
    // <Table
    //   isCompact
    //   removeWrapper
    //   aria-label="Example table with custom cells, pagination and sorting"
    //   bottomContent={bottomContent}
    //   bottomContentPlacement="outside"
    //   checkboxesProps={{
    //     classNames: {
    //       wrapper: "after:bg-foreground after:text-background text-background",
    //     },
    //   }}
    //   classNames={classNames}
    //   selectedKeys={selectedKeys}
    //   selectionMode="multiple"
    //   sortDescriptor={sortDescriptor}
    //   topContent={topContent}
    //   topContentPlacement="outside"
    //   onSelectionChange={setSelectedKeys}
    //   onSortChange={setSortDescriptor}
    // >
    //   <TableHeader columns={headerColumns}>
    //     {(column) => (
    //       <TableColumn
    //         key={column.uid}
    //         align={column.uid === "actions" ? "center" : "start"}
    //         allowsSorting={column.sortable}
    //       >
    //         {column.name}
    //       </TableColumn>
    //     )}
    //   </TableHeader>
    //   <TableBody emptyContent={"No users found"} items={sortedItems}>
    //     {(item) => (
    //       <TableRow key={item.id}>
    //         {(columnKey) => (
    //           <TableCell>{renderCell(item, columnKey)}</TableCell>
    //         )}
    //       </TableRow>
    //     )}
    //   </TableBody>
    // </Table>
  );
}
