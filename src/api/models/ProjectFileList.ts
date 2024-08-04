export interface Criteria {
  id: number;
  shortName: string;
  fullName: string;
  details: string;
  label: string;
}

export interface Paper {
  id: number;
  paperId: number;
  title: string;
  abstract: string;
  pub_date: string;
  author: string;
  pub_venue: string;
  pdfPath: string;
  user_select: string;
  map_select: string;
  criteriaIds?: number[];
  classification: string;
  results?: string[];
  alter_result?: string[]; //module 3 switch
  reason?: string[];
}
export interface Folder {
  id: number;
  title: string;
}
export interface BudgetData {
  estimatedMoney: number;
  currentBudget: number;
}
export interface PaperProcessingData {
  shortName: string;
  label: string;
  positiveCount: number;
  negativeCount: number;
  uncertainCount: number;
  naCount: number;
  totalCount: number;
}

export interface RunStatus {
  status: string;
  processedPaperCount: number;
  remainingPaperCount: number;
  totalPaperCount: number;
  newTokenBalance: number;
  tokenUsed: number;
}
export interface FileListIndexData {
  included: number;
  excluded: number;
  TBD: number;
  unreviewed: number;
  total: number;
}
