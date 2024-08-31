import React, { useEffect, useState } from "react";
import "./ag-grid-theme-builder.css";
import { useIncomeService } from "@/api/hooks/income";
import { useExpenseService } from "@/api/hooks/expense";
import { useAssetsService } from "@/api/hooks/assets";
import { useLiabilityService } from "@/api/hooks/liability";
import { useTransactionService } from "@/api/hooks/transaction";
import TopContent from "./components/TopContent";
import TableContent from "./components/TableContent";
import BottomContent from "./components/BottomContent";
import { Transaction } from "@db/schema";
import { Button } from "@nextui-org/react";
import PopoverConfirm from "../PopoverConfirm";

export default function TransactionsTable() {
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const [filterValue, setFilterValue] = React.useState("");
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTypes, setSelectedTypes] = React.useState<Set<string>>(
    new Set()
  );
  const [selectedSource, setSelectedSource] = React.useState<Set<string>>(
    new Set()
  );
  const [minAmount, setMinAmount] = React.useState<number | undefined>(
    undefined
  );
  const [maxAmount, setMaxAmount] = React.useState<number | undefined>(
    undefined
  );
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [filterConditions, setFilterConditions] = React.useState<"or" | "and">(
    "and"
  );
  const queryFilter = {
    page: page,
    pageSize: rowsPerPage,
    search: filterValue,
    accountId: selectedSource.size > 0 ? Array.from(selectedSource) : undefined,
    type: selectedTypes.size > 0 ? Array.from(selectedTypes) : undefined,
    minAmount: minAmount ? minAmount * 100 : undefined,
    maxAmount: maxAmount ? maxAmount * 100 : undefined,
    startDate: startDate ? startDate.getTime() : undefined,
    endDate: endDate ? endDate.getTime() : undefined,
    filterConditions: filterConditions,
  };
  const { transactions, deleteTransactions } =
    useTransactionService(queryFilter);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const [visibleRowsCount, setVisibleRowsCount] = useState(0);
  useEffect(() => {
    if (transactions) {
      setTotalPages(transactions.totalPages);
      setTotalCount(transactions.totalCount);
      setVisibleRowsCount(transactions.list.length);
    }
  }, [transactions]);
  return (
    <div>
      <TopContent
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        maxAmount={maxAmount}
        setMaxAmount={setMaxAmount}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filterConditions={filterConditions}
        setFilterConditions={setFilterConditions}
        incomes={incomes ?? []}
        expenses={expenses ?? []}
        assets={assets ?? []}
        liabilities={liabilities ?? []}
        totalCount={totalCount}
        selectedRowsCount={selectedRows.length}
        visibleRowsCount={visibleRowsCount}
        onRowsPerPageChange={onRowsPerPageChange}
      />
      <TableContent
        transactionListParams={queryFilter}
        pageSize={rowsPerPage}
        onPageSizeChange={setRowsPerPage}
        totalPages={transactions?.totalPages ?? 0}
        totalCount={transactions?.totalCount ?? 0}
        transactions={transactions?.list ?? []}
        assets={assets ?? []}
        liabilities={liabilities ?? []}
        incomes={incomes ?? []}
        selectedTransactions={selectedRows}
        expenses={expenses ?? []}
        onSelectionChanged={setSelectedRows}
      />
      <BottomContent
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      <div
        className="fixed bottom-0 left-[310px] right-0 bg-background border-t rounded-b-lg border-divider shadow-lg transition-transform duration-300 ease-in-out transform translate-y-0"
        style={{
          transform:
            selectedRows.length > 0 ? "translateY(-10px)" : "translateY(100%)",
          opacity: selectedRows.length > 0 ? 1 : 0,
          transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
        }}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-sm">
            已选择 <span className="font-bold">{selectedRows.length}</span> 项
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => setSelectedRows([])}
              variant="flat"
              size="sm"
              radius="sm"
            >
              取消选择
            </Button>
            <PopoverConfirm
              title="删除所选多个流水"
              desc="删除所选多个流水将无法恢复，请谨慎操作"
              onOk={async () => {
                await deleteTransactions(selectedRows.map((row) => row.id));
                return Promise.resolve();
              }}
            >
              <Button radius="sm" size="sm" color="danger">
                删除所选
              </Button>
            </PopoverConfirm>
          </div>
        </div>
      </div>
    </div>
  );
}
