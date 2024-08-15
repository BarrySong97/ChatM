import { Card, CardBody, Divider } from "@nextui-org/react";
import React, { FC } from "react";
import TransactionsTable from "./components/table";
export interface TransactionsProps {}
const Transactions: FC<TransactionsProps> = () => {
  return (
    <div className="px-12 py-8   mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">流水</h1>
        </div>
      </div>
      <Divider className="my-6" />
      <Card radius="sm" shadow="sm">
        <CardBody>
          <TransactionsTable />
        </CardBody>
      </Card>
    </div>
  );
};

export default Transactions;
