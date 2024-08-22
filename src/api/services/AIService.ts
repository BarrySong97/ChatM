import { Expense, Income, Liability, Asset } from "@db/schema";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-710bf3fdf2fe4fa6bca027e50b7c5007", // This is the default and can be omitted
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.deepseek.com",
});
const propmts = (
  expense: Expense[],
  income: Income[],
  liabilities: Liability[],
  assets: Asset[]
) => {
  const context =
    "你是一个财务管理大师，接下来你将帮我给我的流水数据进行处理。\n" +
    "首先给流水分类，如何给流水分类参考一下流水规则\n" +
    "```\n" +
    "收入（Income）：收入（收入账户） -> 资产（资产账户）：所有收入首先进入资产（如工资、投资收益等）\n" +
    "支出（Expenditure）：资产 -> 支出（支出账户）：从资产中支付日常消费\n" +
    "负债消费（LoanExpenditure）：负债(负债账户) -> 支出（支出账户）：通过负债进行消费\n" +
    "负债借入（Borrow）：负债 -> 资产  借入\n" +
    "还债（RepayLoan）：资产 -> 负债：用资产偿还债务\n" +
    "转账（Transfer）：资产 -> 资产：资产间的转移（如不同银行账户间转账）\n" +
    "```\n" +
    "然后给流水进行设置来源账户和流向账户，账户参考一下账户";
  const background = [
    "然后给流水进行设置来源账户和流向账户，账户参考一下账户: \n",
    `支出账户: ${JSON.stringify(expense)} \n`,
    `收入账户: ${JSON.stringify(income)} \n`,
    `负债账户: ${JSON.stringify(liabilities)} \n`,
    `资产账户: ${JSON.stringify(assets)} \n`,
  ];
  const tone =
    "匹配尽量匹配合适的，如果没有合适就空出来\n" +
    "\n" +
    "接下来我会给你流水数据，请你返回一下形式的json数据，不要回复其他数据\n" +
    "[\n" +
    "{\n" +
    '    "type": "这里是上面流水规则里面的英文枚举"，\n' +
    '    "source_account_id":"来源账户id"，// 具体名字\n' +
    '    "destination_account_id":"流向账户id" // 具体名字\n' +
    "}, ...其他数据]";
  const prompt = context + background.join("") + tone;
  return prompt;
};
export class AIService {
  static async getAIResponse(
    expense: Expense[],
    income: Income[],
    liabilities: Liability[],
    assets: Asset[],
    data: Array<Array<string>>
  ) {
    const dataString = data.map((item) => item.join(", ")).join("\n");
    const prompt = propmts(expense, income, liabilities, assets);
    const controller = new AbortController();
    let signal = controller.signal;
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: dataString },
      ],
      stream: true,
    });
    return response;
  }
}
