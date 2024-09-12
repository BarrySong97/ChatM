import AgentRuntime from "@/lib/agent-runtime/AgentRuntime";
import { Expense, Income, Liability, Asset, Transaction } from "@db/schema";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-710bf3fdf2fe4fa6bca027e50b7c5007", // This is the default and can be omitted
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.deepseek.com",
});

export interface AIServiceParams {
  expense: Expense[];
  income: Income[];
  liabilities: Liability[];
  assets: Asset[];
  data: Array<Transaction>;
  importSource: string;
  provider: string;
  model: string;
  apiKey: string;
  baseURL: string;
}

export class AIService {
  static async getAIResponse({
    expense,
    income,
    liabilities,
    assets,
    data,
    importSource,
    provider,
    model,
    apiKey,
    baseURL,
  }: AIServiceParams) {
    const dataString = JSON.stringify(
      data.map(
        ({
          transaction_date,
          amount,
          status,
          id,
          type,
          destination_account_id,
          source_account_id,
          ...rest
        }) => {
          return Object.fromEntries(
            Object.entries(rest).filter(
              ([_, value]) => value !== null && value !== undefined
            )
          );
        }
      )
    );
    const prompt = `
<role>你是一位资深的财务管理专家，专注于资金流动分类、账户匹配和财务分析。</role>


<background>
流水概念：
   流水记录展示资金在四种账户类型间的流动：
   - 负债账户
   - 收入账户
   - 支出账户
   - 资产账户

</background>
<rules>
2. 分类规则：
   - Income（收入）：收入账户 -> 资产账户（如工资）
   - Expenditure（支出）：资产账户 -> 支出账户（日常消费）
   - LoanExpenditure（负债消费）：负债账户 -> 支出账户（负债相关支出）
   - Refund（退款）：支出账户 -> 资产账户（消费退款）
   - LoanRefund（负债退款）：支出账户 -> 负债账户（负债退款）
   - Borrow（借款）：负债账户 -> 资产账户（借款资金）
   - RepayLoan（还款）：资产账户 -> 负债账户（偿还负债）
   - Transfer（转账）：资产账户 -> 资产账户（内部资金转移）

3. 账户匹配规则：
   - 流水数据来源于 ${importSource}。
   - Income（收入）类型流水：${importSource} 为目标账户（资产账户）。
   - Expenditure（支出）类型流水：${importSource} 为来源账户（资产账户）。
   - LoanExpenditure（负债消费）类型：负债账户为来源账户，支出账户为目标账户。
   - Refund（退款）类型：支出账户为来源账户，${importSource}（资产账户）为目标账户。
   - LoanRefund（负债退款）类型：支出账户为来源账户，负债账户为目标账户。
   - Borrow（借款）类型：负债账户为来源账户，${importSource}（资产账户）为目标账户。
   - RepayLoan（还款）类型：${importSource}（资产账户）为来源账户，负债账户为目标账户。
   - Transfer（转账）类型：两个资产账户之间转账，${importSource} 可能是来源或目标账户。
   - 来源或者目标账户不能是一个
   - 匹配不到对应账户ID时，使用 ${importSource} 的账户ID。

4. 支付宝（alipay）特殊规则：
   - 如果 ${importSource} 是支付宝，需根据流水中的 content 字段来确定具体的支出或收入类型。
   - 以下是支付宝支出分类：
     - 餐饮美食
     - 服饰装扮
     - 日用百货
     - 家居家装
     - 数码电器
     - 运动户外
     - 美容美发
     - 母婴亲子
     - 宠物
     - 交通出行
     - 爱车养车
     - 住房物业
     - 酒店旅游
     - 文化休闲
     - 教育培训
     - 医疗健康
     - 生活服务
     - 公共服务
     - 商业服务
     - 公益捐赠
     - 互助保障
     - 投资理财
     - 保险
     - 信用借还
     - 充值缴费
   - 以下是支付宝收入分类：
     - 收入
     - 转账红包
     - 亲友代付
     - 账户存取
     - 退款

5. 微信（wechat）特殊规则：
   - 如果 ${importSource} 是微信，需根据流水中的 content 字段来确定具体的支出或收入类型。
   - 以下是微信支出分类：
     - 商户消费
     - 信用卡还款
     - 红包
     - 转账
     - 群收款
     - 二维码收付款
     - 充值提现
   - 以下是微信收入分类：
     - 退款

6. 优先级：
   - 匹配账户时，优先选择符合流水性质的账户。
   - 无匹配账户时，留空字段，但确保账户类型正确。

7. 账户信息：
   - 支出账户: ${JSON.stringify(expense)}
   - 收入账户: ${JSON.stringify(income)}
   - 负债账户: ${JSON.stringify(liabilities)}
   - 资产账户: ${JSON.stringify(assets)}
</rules>

<instructions>
1. 逐步思考每笔流水的分类过程，确保符合给定的规则和逻辑。
2. 在处理每笔流水时，先确定其类型，然后根据账户优先级规则选择最合适的来源和目标账户。
3. 在找不到合适账户时，JSON格式必须符合要求。
4. 根据交易内容的数据格式（交易类型:xxxx | 交易对方:xxxx | 商品:xxxxx | 收/付款方式:xxxxx），进行判断
5. 无匹配时使用 ${importSource} 作为备选账户。
6. 特殊账户处理：门的余额宝账户数据（除非账户数据中有专门的财付通或零钱通账户）。
7  - 财付通、零钱通默认匹配为微信，余额宝默认匹配为支付宝（除非有专用账户）。
8. 负债如果收/付款方式或交易对方中账户判断：月付、京东相关的考虑
   - 如果交易内容中没有明确提到花呗、白条、月付、贷款等词，则用卡等词汇时类型。
9. 如果交易类型里面就有消费相关的词语，分类就是支出
10 在微信和支付宝里面给别人转账就是支出，而不是在自己的资产账户之间转账
</instructions>

<task>
1. 根据分类规则，对每笔流水进行分类，并在分类时遵循账户优先级规则，确保资金在四种账户类型之间的流动符合逻辑。
2. 为每条流水明确指定**来源账户（source_account_id）**和**目标账户（destination_account_id）**，确保这些账户属于四种账户类型中的一个，并按照优先级规则选取最合适的账户。
3. 处理完所有流水数据后，请返回以下格式的 JSON 数据（请勿使用其他格式）：
   <output_format>
   [
     {
       "type": "对应流水规则的英文枚举类型",
       "source_account_id": "来源账户的id",
       "destination_account_id": "目标账户的id",
     },
     // ... 其他流水记录
   ]
   </output_format>
</task>


格式符我将给你一些流水数据。合按照上述要求要求这些
现在，请处理以下流水数据并返回JSON结果。
`;

    const agentRuntime = await AgentRuntime.initializeWithProviderOptions(
      provider,
      {
        [provider]: { apiKey: apiKey, baseURL: baseURL },
      }
    );
    const response = await agentRuntime.chat({
      model: model,
      temperature: 0.2,
      messages: [
        { role: "system", content: prompt },
        // { role: "user", content: prompt },
        { role: "user", content: dataString },
      ],
      stream: true,
    });

    return response as any;
  }
}
