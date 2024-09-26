import { ImportCategory } from "./import-category";
import yinlian from "./icon/union.png";
import Wechat from "./icon/wechat.png";
import Pixiu from "./icon/pixiu.png";
import { PhBank, TablerTemplate } from "@/assets/icon";
import { v4 as uuidv4 } from "uuid";
import Alipay from "./icon/zhifubao.webp";
import { FinancialOperation } from "@/api/db/manager";
import { Asset, Expense, Income } from "@db/schema";
export const CategoryTypes: ImportCategory[] = [
  {
    name: "微信",
    key: "wechat",
    icon: <img src={Wechat} alt="" className="w-16 h-16" />,
  },
  {
    name: "支付宝",
    key: "alipay",
    icon: <img src={Alipay} alt="" className="w-16 h-16" />,
  },
  {
    name: "貔貅",
    key: "pixiu",
    icon: <img src={Pixiu} alt="" className="w-16 h-16" />,
  },
  {
    name: "模板导入",
    key: "template",
    icon: <TablerTemplate className="w-16 h-16" />,
  },
  {
    name: "银行卡（开发中）",
    key: "china_bank",
    icon: <img src={yinlian} alt="" className="h-16" />,
  },
];
const wechatColumn = [
  "交易时间",
  "交易类型",
  "交易对方",
  "商品",
  "收/支",
  "金额(元)",
  "支付方式",
  "当前状态",
  "交易单号",
  "商户单号",
  "备注",
];

const alipayColumn = [
  // Alipay columns would go here
];

const chinaBankColumn = [
  // China Bank columns would go here
];

function getWechatData(data: string[][]) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item[0]) {
      result.push({
        id: uuidv4(),
        transaction_date: item[0],
        amount: Number(item[5].slice(1)),
        type: item[4],
        content: `交易类型: ${item[1]} | 交易对方:${item[2]} | 商品:${item[3]} | 收/付款方式:${item[6]}`,
      });
    }
  }
  return result;
}
function getAlipayData(data: string[][]) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item[0]) {
      result.push({
        id: uuidv4(),
        transaction_date: item[0],
        amount: Number(item[6]),
        type: item[5],
        content: `交易类型：${item[1]} | 交易对方:${item[2]} | 商品: ${item[4]} | 收/付款方式:${item[7]}`,
      });
    }
  }
  return result;
}
function getTemplateData(data: string[][]) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item[0]) {
      result.push({
        id: uuidv4(),
        transaction_date: item[0],
        amount: Number(item[2]),
        content: item[1],
      });
    }
  }
  return result;
}

function getPixiuData(
  data: string[][],
  income?: Income[],
  asset?: Asset[],
  expenditure?: Expense[]
) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item[0]) {
      const type = item[2].includes("收入")
        ? FinancialOperation.Income
        : FinancialOperation.Expenditure;
      let destination_account_id = "";
      let source_account_id = "";
      if (type === FinancialOperation.Income) {
        source_account_id =
          income?.find((account) => account.name === item[2])?.id ?? "";
        destination_account_id =
          asset?.find((account) => account.name === item[7])?.id ?? "";
      } else {
        source_account_id =
          asset?.find((account) => account.name === item[7])?.id ?? "";
        destination_account_id =
          expenditure?.find((account) => account.name === item[2])?.id ?? "";
        console.log(item[2], item[7]);
      }
      result.push({
        id: uuidv4(),
        transaction_date: item[0],
        amount: Number(item[4] === "0" ? item[5] : item[4]),
        type: type,
        content: item[9],
        destination_account_id: destination_account_id,
        source_account_id: source_account_id,
      });
    }
  }
  return result;
}

function china_bank(data: string[][], column: string[]) {}

export {
  getWechatData,
  getAlipayData,
  china_bank,
  getTemplateData,
  getPixiuData,
};
