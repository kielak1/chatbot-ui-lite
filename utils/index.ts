// utils/index.ts
import { Message } from "@/types";

export const OpenAIStream = async (messages: Message[]) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...messages,
      ],
      temperature: 0.1,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(
      "❌ OpenAI API error:",
      res.status,
      res.statusText,
      errorText
    );
    throw new Error(`[${res.status}] ${res.statusText || "OpenAI API error"}`);
  }

  return res.body; // strumień zwracany do API route
};
