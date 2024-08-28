import React, { useState } from "react";
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

export default function TransactionsTable() {
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);

  const [filterValue, setFilterValue] = React.useState("");
  const { incomes } = useIncomeService();
  const { expenses } = useExpenseService();
  const { assets } = useAssetsService();
  const { liabilities } = useLiabilityService();
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [selectedTypes, setSelectedTypes] = React.useState<Set<string>>(
    new Set()
  );
  const [selectedSource, setSelectedSource] = React.useState<Set<string>>(
    new Set()
  );
  const [minAmount, setMinAmount] = React.useState<number>(0);
  const [maxAmount, setMaxAmount] = React.useState<number>(0);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [filterConditions, setFilterConditions] = React.useState<"or" | "and">(
    "and"
  );
  const { transactions } = useTransactionService({
    page: page,
    pageSize: rowsPerPage,
    search: filterValue,
    accountId: selectedSource.size > 0 ? Array.from(selectedSource) : undefined,
    type: selectedTypes.size > 0 ? Array.from(selectedTypes) : undefined,
    minAmount: minAmount,
    maxAmount: maxAmount,
    startDate: startDate ? startDate.getTime() : undefined,
    endDate: endDate ? endDate.getTime() : undefined,
    filterConditions: filterConditions,
  });

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );
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
        totalCount={transactions?.totalCount ?? 0}
        selectedRowsCount={selectedRows.length}
        visibleRowsCount={transactions?.list.length ?? 0}
        onRowsPerPageChange={onRowsPerPageChange}
      />
      <TableContent
        transactions={transactions?.list ?? []}
        assets={assets ?? []}
        liabilities={liabilities ?? []}
        incomes={incomes ?? []}
        expenses={expenses ?? []}
        onSelectionChanged={setSelectedRows}
      />
      {transactions && (
        <BottomContent
          page={page}
          totalPages={transactions.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
