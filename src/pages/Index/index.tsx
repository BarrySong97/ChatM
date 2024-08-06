import { MaterialSymbolsSearch } from "@/assets/icon";
import PaperParse from "papaparse";
import { Button, Divider, Input } from "@nextui-org/react";
import React, { FC, useRef, useState } from "react";
import { Trend } from "./components/trend";
import Category from "./components/category";
import { atom } from "jotai";
import { useQuery } from "react-query";
import { database } from "@/db";
import Transactions from "./components/transacrtions";
import { useNavigate } from "react-router-dom";
export const flowAtom = atom<"expense" | "income">("expense");
export interface IndexProps {}
const Greeting: React.FC = () => {
  const currentHour = new Date().getHours();
  let greeting = "早上好";

  if (currentHour >= 12 && currentHour < 18) {
    greeting = "中午好";
  } else if (currentHour >= 18 || currentHour < 6) {
    greeting = "晚上好";
  }

  return <h1 className="text-lg font-medium">{greeting}</h1>;
};

const DateDisplay: React.FC = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("zh-cn", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return <p className="text-gray-500 text-sm">{formattedDate}</p>;
};

const Index: FC<IndexProps> = () => {
  const { data } = useQuery("accounts", {
    queryFn: async () => {
      return database.query.accounts.findMany();
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFile(file);
      PaperParse.parse(file, {
        complete(results, file) {
          navigate("/mapping", {
            state: { data: results.data },
          });
        },
      });
    }
  };
  return (
    <div className="px-12 py-8  mx-auto overflow-auto">
      <div className="flex justify-between items-end">
        <div>
          <Greeting />
          <DateDisplay />
        </div>
        <div className="flex items-center gap-2 ">
          <Input
            className="max-w-[200px] "
            radius="full"
            endContent={
              <MaterialSymbolsSearch className="text-gray-400 text-xl" />
            }
            placeholder="Search Transactions"
            size="sm"
            labelPlacement="outside"
          />
          <div>
            <input
              onChange={handleChange}
              ref={inputRef}
              id="file"
              type="file"
              className="hidden"
            />
            <Button onClick={handleClick} size="sm" color="primary">
              上传csv
            </Button>
          </div>
        </div>
      </div>
      <Divider className="my-8" />
      <div className="space-y-8">
        {data?.map((v) => {
          return (
            <>
              <h3>{v.title}</h3>
              <div className="flex gap-8 h-[240px] mb-8">
                <Trend />
                <Category />
              </div>
              <Transactions key={v.id} account={v} />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
