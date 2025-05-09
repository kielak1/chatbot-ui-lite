export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-4.1",
}

export interface Message {
  role: Role;
  content: string;
}

export type Role = "assistant" | "user";
