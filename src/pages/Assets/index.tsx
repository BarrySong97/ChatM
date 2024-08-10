import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import { FC } from "react";
import SectionCard from "../Index/components/SectionCard";
import { Space, Table, TableProps } from "antd";
import {
  IcBaselineWechat,
  MaterialSymbolsArrowForwardIosRounded,
} from "@/assets/icon";
import { CategoryListLineChart } from "./components/line";
import { useNavigate } from "react-router-dom";
export interface PageProps {}
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}
const Page: FC<PageProps> = () => {
  const navigate = useNavigate();
  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render(value, record, index) {
        return (
          <Chip
            variant="flat"
            avatar={<IcBaselineWechat className="!text-green-500 text-xl" />}
          >
            <div>微信</div>
          </Chip>
        );
      },
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      render(value, record, index) {
        return `${13}%`;
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render(value, record, index) {
        return `100K`;
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render(value, record, index) {
        return <CategoryListLineChart />;
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render(value, record, index) {
        return (
          <Button
            onClick={() => {
              navigate("/category/1");
            }}
            isIconOnly
            size="sm"
            variant="light"
            radius="sm"
          >
            <MaterialSymbolsArrowForwardIosRounded />
          </Button>
        );
      },
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
    <div className="px-12 py-8 mt-6  mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">资产</h1>
        </div>
        {/* <Button onClick={onOpen} size="sm" color="primary">
          添加
        </Button> */}
      </div>
      <Divider className="my-6" />
      <div className="mt-8">
        <SectionCard
          title={
            <div>
              <div className="text-sm font-medium text-gray-500"> 总资产 </div>
              <div className="text-gray-900 text-3xl font-medium">100M</div>
            </div>
          }
        />
      </div>
      <Card shadow="sm" radius="sm">
        <Table
          bordered={false}
          showHeader={false}
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Page;
