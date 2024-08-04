import { database } from "@/db";
import { Button, Divider } from "@nextui-org/react";
import React, { FC } from "react";
import { useQuery } from "react-query";
import AccountCard from "./components/account-card";
export interface AccountProps {}
const Account: FC<AccountProps> = () => {
  const { data } = useQuery("accounts", {
    queryFn: async () => {
      return database.query.accounts.findMany();
    },
  });
  return (
    <div className="px-12 py-8 mt-6  mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">账户</h1>
        </div>
        <Button size="sm" color="primary">
          添加
        </Button>
      </div>
      <Divider className="my-6" />
      <div className=" grid grid-cols-4 gap-8">
        {data?.map((account) => (
          <AccountCard key={account.id} data={account} />
        ))}
      </div>
    </div>
  );
};

export default Account;
