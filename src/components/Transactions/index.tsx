import React, { useEffect, useState } from "react";
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
import SelectedRowsActions from "./components/SelectedRowsActions";

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
      <SelectedRowsActions
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        deleteTransactions={deleteTransactions as any}
      />
    </div>
  );
}
