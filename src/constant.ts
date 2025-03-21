export enum IPC_EVENT_KEYS {
  SIGN_IN = "sign_in",
  SIGN_OUT = "sign_out",
  CHECK_SIGN_IN = "check_sign_in",
  DEV_TOOL = "dev_tool",
  OPEN_PROJECT = "open_project",
  WINDOW_RESIZE = "window_resize",
  OPEN_FOLDER = "open_folder",
  OPEN_FILE = "open_file",
  SAVE_CSV_FILE = "save_csv_file",
}
export enum MAIN_SEND_RENDER_KEYS {
  MAXIMIZE = "maximize",
  RESTORE = "restore",
  MINIMIZE = "minimize",
}
export enum ModuleType {
  TITLE_ABSTRACT_SCREENING = "title_abstract_screening",
  FULL_TEXT_SCREENING = "full_text_screening",
  DATA_EXTRACTION = "data_extraction",
  RISK_BIAS_ASSESSMENT = "risk_bias_assessment",
}
export enum TRAFFIC_LIGHT {
  MAXIMIZE = "maximize",
  MINIMIZE = "minimize",
  RESTORE = "restore",
  CLOSE = "close",
}
export const CN_ACCOUNTS = ["微信", "支付宝", "工商银行"];

export enum ACCOUNT_TYPE {
  INCOME = 0,
  EXPENSE = 1,
  ASSET = 2,
  LIABILITY = 3,
}

export enum TRANSACTION_FLOW {
  INCOME_TO_ASSET = 0,
  ASSET_TO_EXPENSE = 1,
  LIABILITY_TO_EXPENSE = 2,
  ASSET_TO_LIABILITY = 3,
  ASSET_TO_ASSET = 4,
}

export enum TRANSACTION_TYPE {
  INCOME = 0,
  EXPENSE = 1,
}

export const CN_ACCOUNTS_TEMPLATE = {
  微信: '[{"source":"交易时间","target":"date","animated":true,"id":"xy-edge__交易时间-date"},{"source":"商品","target":"content","animated":true,"id":"xy-edge__商品-content"},{"source":"收/支","target":"type","animated":true,"id":"xy-edge__收/支-type"},{"source":"金额(元)","target":"amount","animated":true,"id":"xy-edge__金额(元)-amount"},{"source":"备注","target":"description","animated":true,"id":"xy-edge__备注-description"},{"source":"交易类型","target":"content","animated":true,"id":"xy-edge__交易类型-content"}]',
  支付宝:
    '[{"source":"交易时间","target":"date","animated":true,"id":"xy-edge__交易时间-date"},{"source":"收/支","target":"type","animated":true,"id":"xy-edge__收/支-type","sourceHandle":null,"targetHandle":null},{"source":"金额","target":"amount","animated":true,"id":"xy-edge__金额-amount"},{"source":"商品说明","target":"content","animated":true,"id":"xy-edge__商品说明-content"},{"source":"备注","target":"description","animated":true,"id":"xy-edge__备注-description"}]',
  工商银行:
    '[{"source":"交易日期","target":"date","animated":true,"id":"xy-edge__交易日期-date"},{"source":"摘要","target":"content","animated":true,"id":"xy-edge__摘要-content"},{"source":"记账金额(收入)","target":"amount","animated":true,"id":"xy-edge__记账金额(收入)-amount"},{"source":"记账金额(支出)","target":"amount","animated":true,"id":"xy-edge__记账金额(支出)-amount"},{"source":"交易场所","target":"content","animated":true,"id":"xy-edge__交易场所-content"},{"source":"对方户名","target":"content","animated":true,"id":"xy-edge__对方户名-content"}]',
} as const;

export type CN_ACCOUNTS = keyof typeof CN_ACCOUNTS_TEMPLATE;
