import { Card, CardBody, Divider } from "@nextui-org/react";
import "./components/index.css";
import { FC } from "react";
import TransactionsTable from "@/components/Transactions";
import { PageWrapper } from "@/components/PageWrapper";
export interface TransactionsProps {}
const Transactions: FC<TransactionsProps> = () => {
  return (
    <PageWrapper>
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
    </PageWrapper>
  );
};

export default Transactions;
