import { BookService } from "./api/services/BookService";
import { ProviderService } from "./api/services/ProviderService";
import { ModelService } from "./api/services/ModelService";
import { DEFAULT_MODEL_PROVIDER_LIST } from "./lib/agent-runtime/modelProviders";
import { UserService } from "./api/services/user";
import { AssetsService } from "./api/services/AssetsSevice";
import { LiabilityService } from "./api/services/LiabilityService";
import { IncomeService } from "./api/services/IncomeService";
import { ExpenseService } from "./api/services/ExpenseService";

const initAssets = [
  {
    name: "微信钱包",
    icon: "wallet:wechat",
  },
  {
    name: "支付宝",
    icon: "wallet:alipay",
  },
  {
    name: "固定资产房子",
    icon: "emoji:house",
  },
  {
    name: "固定资产车子",
    icon: "emoji:car",
  },
  {
    name: "中国建设银行",
    icon: "bank:/bank/logo/CCB.png",
  },
  {
    name: "中国工商银行",
    icon: "bank:/bank/logo/ICBC.png",
  },
  {
    name: "中国农业银行",
    icon: "bank:/bank/logo/ABC.png",
  },
];
const initLiabilities = [
  {
    name: "花呗",
    icon: "emoji:cherry_blossom",
  },
  {
    name: "白条",
    icon: "emoji:page_facing_up",
  },
  {
    name: "借呗",
    icon: "emoji:money_with_wings",
  },
  {
    name: "房贷",
    icon: "emoji:house",
  },
  {
    name: "车贷",
    icon: "emoji:car",
  },
];
const initIncomes = [
  {
    name: "工资",
    icon: "emoji:briefcase",
  },
  {
    name: "奖金",
    icon: "emoji:moneybag",
  },
];
const initExpenses = [
  {
    name: "餐饮",
    icon: "emoji:hamburger",
  },
  {
    name: "购物",
    icon: "emoji:shopping_bags",
  },
  {
    name: "娱乐",
    icon: "emoji:movie_camera",
  },
  {
    name: "交通",
    icon: "emoji:bus",
  },
  {
    name: "旅游",
    icon: "emoji:airplane",
  },
  {
    name: "教育",
    icon: "emoji:school",
  },
];

export async function seed() {
  // Seed default book if not exists
  const books = await BookService.listBooks();
  if (!books.length) {
  }

  // Seed providers and models if not exists
  const providers = await ProviderService.listProviders();
  const user = await UserService.findDefault();
  if (!user) {
    const book = await BookService.createBook({
      name: "默认账本",
      isDefault: 1,
      isCurrent: 1,
    });
    await UserService.initUser({
      name: "",
    });
    if (!providers.length) {
      for (const providerData of DEFAULT_MODEL_PROVIDER_LIST) {
        const provider = await ProviderService.createProvider({
          name: providerData.name,
          baseUrl: providerData.baseURL || "", // Set default base URL
          defaultModel: providerData.defaultModel || "", // Set default model
          is_default: providerData.name === "DeepSeek" ? 1 : 0,
          // Note: We're not setting apiKey here as it should be set by the user
        });

        for (const modelData of providerData.chatModels) {
          if (modelData.id === "deepseek-chat") {
            localStorage.setItem("selectedModel", modelData.id);
          }
          await ModelService.createModel({
            name: modelData.id,
            providerId: provider.id,
          });
        }
      }
    }
    for (const asset of initAssets) {
      await AssetsService.createAsset({
        name: asset.name,
        icon: asset.icon,
        book_id: book.id,
        initial_balance: 0,
      });
    }
    for (const liability of initLiabilities) {
      await LiabilityService.createLiability(book.id, {
        name: liability.name,
        icon: liability.icon,
        initial_balance: 0,
      });
    }
    for (const income of initIncomes) {
      await IncomeService.createIncome({
        name: income.name,
        icon: income.icon,
        book_id: book.id,
      });
    }
    for (const expense of initExpenses) {
      await ExpenseService.createExpense({
        name: expense.name,
        icon: expense.icon,
        book_id: book.id,
      });
    }
  }
}
