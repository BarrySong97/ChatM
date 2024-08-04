interface Criteria {
  id: number;
  shortName: string;
  description: string;
  label: string;
  details: string;
  disabled: boolean;
  fullName?: string;
  type: string;
  category: string;
  pin: false;
}

interface CommonCriteria extends Criteria {
  shortName: string;
  label: string;
  details: string;
}

interface SpecificCriteria extends Criteria {
  shortName: string;
  label: string;
  details: string;
}

export interface Criterias {
  common: CommonCriteria[];
  specific: SpecificCriteria[];
}
export interface Question {
  id: number;
  type: string;
  disabled: boolean;
  pin: boolean;
  shortName: string;
  description: string;
  fullName?: string;
  label: string;
  details: string;
}
interface ChatMessageItem {
  userInput: string;
  bot_msg: string;
  research_question: string;
  keywords: string[];
  suggestions: {
    common: CommonCriteria[];
    specific: SpecificCriteria[];
    question: Question[];
  };
}
export interface Message {
  id: number;
  user_id: number;
  project_id: number;
  module_id: number;
  msg_time: string; // Using string for ISO 8601 date format
  msg_from: string;
  msg_content: string;
}
